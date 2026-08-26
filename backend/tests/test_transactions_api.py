from backend.models import Transaction


def test_create_transaction(client, db):
    response = client.post(
        "/transactions",
        json={"title": "Salary", "amount": 10000000, "type": "income", "category": "Work"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Salary"
    assert data["amount"] == 10000000
    assert data["type"] == "income"


def test_get_transaction_not_found(client):
    response = client.get("/transactions/999999")
    assert response.status_code == 404


def test_update_transaction(client, db):
    transaction = Transaction(title="Old", amount=100, type="expense", category="Food")
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    response = client.put(
        f"/transactions/{transaction.id}",
        json={"title": "New", "amount": 250, "type": "expense", "category": "Food"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New"
    assert response.json()["amount"] == 250


def test_delete_transaction(client, db):
    transaction = Transaction(title="Coffee", amount=50, type="expense", category="Food")
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    response = client.delete(f"/transactions/{transaction.id}")
    assert response.status_code == 200
    assert db.query(Transaction).filter(Transaction.id == transaction.id).first() is None


def test_delete_transaction_not_found(client):
    response = client.delete("/transactions/999999")
    assert response.status_code == 404
