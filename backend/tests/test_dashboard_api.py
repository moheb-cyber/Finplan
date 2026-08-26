from datetime import datetime

from backend.models import Budget, Transaction


def test_dashboard_returns_month_totals(client, db):
    db.add_all([
        Transaction(title="Salary", amount=10000, type="income", category="Work", created_at=datetime(2026, 8, 5)),
        Transaction(title="Food", amount=2500, type="expense", category="Food", created_at=datetime(2026, 8, 6)),
        Transaction(title="Old expense", amount=9000, type="expense", category="Food", created_at=datetime(2026, 7, 31)),
        Budget(category="Food", amount=5000, month="2026-08"),
    ])
    db.commit()

    response = client.get("/dashboard", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()
    assert data["income"] == 10000
    assert data["expense"] == 2500
    assert data["balance"] == 7500
    assert data["total_budget"] == 5000
    assert data["budget_spent"] == 2500
    assert data["budget_remaining"] == 2500
    assert data["budget_status"] == "on_track"


def test_dashboard_without_budget_reports_no_budget(client, db):
    db.add(Transaction(
        title="Coffee",
        amount=100,
        type="expense",
        category="Food",
        created_at=datetime(2026, 8, 10),
    ))
    db.commit()

    response = client.get("/dashboard", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_budget"] == 0
    assert data["budget_spent"] == 0
    assert data["budget_remaining"] == 0
    assert data["budget_status"] == "no_budget"
