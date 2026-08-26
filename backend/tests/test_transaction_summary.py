from datetime import datetime

from backend.models import Transaction


def test_transaction_summary_respects_date_range(client, db):
    db.add_all([
        Transaction(title="Before", amount=100, type="expense", category="Food", created_at=datetime(2026, 7, 31)),
        Transaction(title="Inside", amount=250, type="expense", category="Food", created_at=datetime(2026, 8, 10)),
        Transaction(title="Income", amount=1000, type="income", category="Work", created_at=datetime(2026, 8, 11)),
        Transaction(title="After", amount=500, type="expense", category="Food", created_at=datetime(2026, 9, 1)),
    ])
    db.commit()

    response = client.get("/transactions/summary", params={"from_date": "2026-08-01", "to_date": "2026-08-31"})

    assert response.status_code == 200
    assert response.json() == {
        "total_income": 1000,
        "total_expense": 250,
        "balance": 750,
        "transaction_count": 2,
    }
