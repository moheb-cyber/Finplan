from uuid import uuid4


def register(client, name, password="password123"):
    email = f"{uuid4().hex}@example.com"
    response = client.post("/auth/register", json={"name": name, "email": email, "password": password})
    assert response.status_code == 200
    return response.json()


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_me(client):
    created = register(client, "Test User")
    assert created["user"]["name"] == "Test User"
    assert created["token"]

    me = client.get("/auth/me", headers=auth_headers(created["token"]))
    assert me.status_code == 200
    assert me.json()["email"] == created["user"]["email"]

    login = client.post("/auth/login", json={"email": created["user"]["email"], "password": "password123"})
    assert login.status_code == 200
    assert login.json()["user"]["id"] == created["user"]["id"]


def test_protected_endpoints_require_auth(client):
    assert client.get("/transactions").status_code == 401
    assert client.get("/budgets").status_code == 401
    assert client.get("/dashboard", params={"month": "2026-08"}).status_code == 401


def test_users_cannot_access_each_others_transactions(client):
    first = register(client, "First User")
    second = register(client, "Second User")

    created = client.post("/transactions", headers=auth_headers(first["token"]), json={
        "title": "Private expense", "amount": 100, "type": "expense", "category": "Food"
    })
    assert created.status_code == 200
    transaction_id = created.json()["id"]

    second_list = client.get("/transactions", headers=auth_headers(second["token"]))
    assert second_list.status_code == 200
    assert all(item["id"] != transaction_id for item in second_list.json())

    not_owned = client.delete(f"/transactions/{transaction_id}", headers=auth_headers(second["token"]))
    assert not_owned.status_code == 404
