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
    db.add(Transaction(title="Coffee", amount=100, type="expense", category="Food", created_at=datetime(2026, 8, 10)))
    db.commit()

    response = client.get("/dashboard", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_budget"] == 0
    assert data["budget_spent"] == 0
    assert data["budget_remaining"] == 0
    assert data["budget_status"] == "no_budget"


def test_dashboard_ignores_transactions_outside_selected_month(client, db):
    db.add_all([
        Transaction(title="July", amount=500, type="expense", category="Food", created_at=datetime(2026, 7, 31)),
        Transaction(title="August", amount=200, type="expense", category="Food", created_at=datetime(2026, 8, 10)),
        Transaction(title="September", amount=1000, type="income", category="Work", created_at=datetime(2026, 9, 1)),
    ])
    db.commit()

    response = client.get("/dashboard", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()
    assert data["income"] == 0
    assert data["expense"] == 200
    assert data["balance"] == -200


def test_dashboard_budget_spent_uses_budget_categories(client, db):
    db.add_all([
        Budget(category="Food", amount=1000, month="2026-08"),
        Budget(category="Transport", amount=500, month="2026-08"),
        Transaction(title="Food", amount=250, type="expense", category="Food", created_at=datetime(2026, 8, 5)),
        Transaction(title="Transport", amount=100, type="expense", category="Transport", created_at=datetime(2026, 8, 6)),
        Transaction(title="Other", amount=900, type="expense", category="Shopping", created_at=datetime(2026, 8, 7)),
    ])
    db.commit()

    response = client.get("/dashboard", params={"month": "2026-08"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_budget"] == 1500
    assert data["budget_spent"] == 350
    assert data["budget_remaining"] == 1150
