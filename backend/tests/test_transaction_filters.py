from datetime import datetime

from backend.models import Transaction


def test_transactions_filter_by_type_and_category(client, db):
    db.add_all([
        Transaction(title="Salary", amount=1000, type="income", category="Work", created_at=datetime(2026, 8, 1)),
        Transaction(title="Lunch", amount=100, type="expense", category="Food", created_at=datetime(2026, 8, 2)),
        Transaction(title="Dinner", amount=200, type="expense", category="Food", created_at=datetime(2026, 8, 3)),
    ])
    db.commit()

    response = client.get("/transactions", params={"type": "expense", "category": "Food"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(item["type"] == "expense" for item in data)
    assert all(item["category"] == "Food" for item in data)


def test_transactions_filter_by_date_range(client, db):
    db.add_all([
        Transaction(title="Before", amount=100, type="expense", category="Food", created_at=datetime(2026, 7, 31)),
        Transaction(title="Inside", amount=200, type="expense", category="Food", created_at=datetime(2026, 8, 10)),
        Transaction(title="After", amount=300, type="expense", category="Food", created_at=datetime(2026, 9, 1)),
    ])
    db.commit()

    response = client.get("/transactions", params={"from_date": "2026-08-01", "to_date": "2026-08-31"})
    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["Inside"]
