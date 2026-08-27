from uuid import uuid4


def register(client, name):
    email = f"{uuid4().hex}@example.com"
    response = client.post(
        "/auth/register",
        json={"name": name, "email": email, "password": "password123"},
    )
    assert response.status_code == 200
    return response.json()


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_transaction_date_filters_reject_invalid_dates(client):
    created = register(client, "Date Test")
    headers = auth_headers(created["token"])

    response = client.get("/transactions", headers=headers, params={"from_date": "2026-99-99"})
    assert response.status_code == 422


def test_transaction_summary_rejects_invalid_dates(client):
    created = register(client, "Summary Test")
    headers = auth_headers(created["token"])

    response = client.get("/transactions/summary", headers=headers, params={"to_date": "not-a-date"})
    assert response.status_code == 422


def test_budget_update_rejects_duplicate_category_month(client):
    created = register(client, "Budget Test")
    headers = auth_headers(created["token"])

    first = client.post(
        "/budgets",
        headers=headers,
        json={"category": "Food", "amount": 500, "month": "2026-08"},
    )
    second = client.post(
        "/budgets",
        headers=headers,
        json={"category": "Transport", "amount": 300, "month": "2026-08"},
    )
    assert first.status_code == 200
    assert second.status_code == 200

    response = client.put(
        f"/budgets/{second.json()['id']}",
        headers=headers,
        json={"category": "Food", "amount": 300, "month": "2026-08"},
    )
    assert response.status_code == 409


def test_users_cannot_modify_each_others_budget(client):
    first = register(client, "Budget Owner")
    second = register(client, "Other User")

    created = client.post(
        "/budgets",
        headers=auth_headers(first["token"]),
        json={"category": "Food", "amount": 500, "month": "2026-08"},
    )
    assert created.status_code == 200

    budget_id = created.json()["id"]
    response = client.put(
        f"/budgets/{budget_id}",
        headers=auth_headers(second["token"]),
        json={"category": "Food", "amount": 999, "month": "2026-08"},
    )
    assert response.status_code == 404
