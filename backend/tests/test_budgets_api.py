from backend.models import Budget


def test_create_budget(client):
    response = client.post(
        "/budgets",
        json={"category": "Food", "amount": 5000000, "month": "2026-08"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Food"
    assert data["amount"] == 5000000
    assert data["month"] == "2026-08"


def test_create_duplicate_budget_is_rejected(client):
    payload = {"category": "Food", "amount": 5000000, "month": "2026-08"}
    assert client.post("/budgets", json=payload).status_code == 200
    response = client.post("/budgets", json=payload)
    assert response.status_code == 400


def test_update_budget_not_found(client):
    response = client.put(
        "/budgets/999999",
        json={"category": "Food", "amount": 5000000, "month": "2026-08"},
    )
    assert response.status_code == 404


def test_delete_budget(client, db):
    budget = Budget(category="Transport", amount=2000000, month="2026-08")
    db.add(budget)
    db.commit()
    db.refresh(budget)

    response = client.delete(f"/budgets/{budget.id}")
    assert response.status_code == 200
    assert db.query(Budget).filter(Budget.id == budget.id).first() is None


def test_delete_budget_not_found(client):
    response = client.delete("/budgets/999999")
    assert response.status_code == 404
