from datetime import datetime

from backend.models import Budget, Transaction


def test_budget_summary_calculates_remaining_and_status(client, db):
    db.add(Budget(category="Food", amount=1000, month="2026-08"))
    db.add_all([
        Transaction(title="Lunch", amount=300, type="expense", category="Food", created_at=datetime(2026, 8, 3)),
        Transaction(title="Dinner", amount=200, type="expense", category="Food", created_at=datetime(2026, 8, 20)),
    ])
    db.commit()

    response = client.get("/budgets/summary", params={"month": "2026-08"})
    assert response.status_code == 200
    assert response.json() == [{
        "category": "Food",
        "budget": 1000,
        "spent": 500,
        "remaining": 500,
        "status": "on_track",
        "spent_percentage": 50.0,
        "remaining_percentage": 50.0,
    }]


def test_budget_summary_detects_over_budget(client, db):
    db.add(Budget(category="Transport", amount=100, month="2026-08"))
    db.add(Transaction(
        title="Taxi",
        amount=150,
        type="expense",
        category="Transport",
        created_at=datetime(2026, 8, 8),
    ))
    db.commit()

    response = client.get("/budgets/summary", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()[0]
    assert data["status"] == "over_budget"
    assert data["remaining"] == -50
    assert data["spent_percentage"] == 150.0
