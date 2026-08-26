from datetime import datetime

from backend.models import Transaction


def seed_transactions(db):
    db.add_all([
        Transaction(title="Salary", amount=5000, type="income", category="Work", created_at=datetime(2026, 8, 5)),
        Transaction(title="Lunch", amount=300, type="expense", category="Food", created_at=datetime(2026, 8, 10)),
        Transaction(title="Bus", amount=150, type="expense", category="Transport", created_at=datetime(2026, 8, 20)),
    ])
    db.commit()


def test_get_transactions_filters_by_type(client, db):
    seed_transactions(db)
    response = client.get("/transactions", params={"type": "expense"})
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert all(item["type"] == "expense" for item in response.json())


def test_get_transactions_filters_by_category(client, db):
    seed_transactions(db)
    response = client.get("/transactions", params={"category": "Food"})
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Lunch"


def test_get_transactions_filters_by_date_range(client, db):
    seed_transactions(db)
    response = client.get("/transactions", params={"from_date": "2026-08-06", "to_date": "2026-08-15"})
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Lunch"
