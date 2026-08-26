from backend.models import Budget, Transaction


def test_get_budgets_can_filter_by_month(client, db):
    db.add_all([
        Budget(category="Food", amount=1000, month="2026-08"),
        Budget(category="Travel", amount=2000, month="2026-09"),
    ])
    db.commit()

    response = client.get("/budgets", params={"month": "2026-08"})

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["category"] == "Food"


def test_budget_summary_counts_only_matching_category_expenses(client, db):
    db.add(Budget(category="Food", amount=1000, month="2026-08"))
    db.add_all([
        Transaction(title="Lunch", amount=300, type="expense", category="Food"),
        Transaction(title="Bus", amount=200, type="expense", category="Transport"),
        Transaction(title="Salary", amount=5000, type="income", category="Food"),
    ])
    db.commit()

    response = client.get("/budgets/summary", params={"month": "2026-08"})

    assert response.status_code == 200
    data = response.json()[0]
    assert data["spent"] == 300
    assert data["remaining"] == 700
    assert data["status"] == "on_track"


def test_dashboard_budgets_returns_requested_month(client, db):
    db.add(Budget(category="Food", amount=1000, month="2026-08"))
    db.commit()

    response = client.get("/dashboard/budgets", params={"month": "2026-08"})

    assert response.status_code == 200
    assert response.json()["month"] == "2026-08"
    assert response.json()["budgets"][0]["category"] == "Food"
