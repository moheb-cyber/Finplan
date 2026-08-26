from backend.models import Transaction


def test_transaction_summary(client, db):
    db.add_all([
        Transaction(title="Salary", amount=1000, type="income", category="Work"),
        Transaction(title="Food", amount=250, type="expense", category="Food"),
        Transaction(title="Transport", amount=100, type="expense", category="Transport"),
    ])
    db.commit()

    response = client.get("/transactions/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 1000
    assert data["total_expense"] == 350
    assert data["balance"] == 650
    assert data["transaction_count"] == 3


def test_expenses_by_category(client, db):
    db.add_all([
        Transaction(title="Lunch", amount=200, type="expense", category="Food"),
        Transaction(title="Dinner", amount=300, type="expense", category="Food"),
        Transaction(title="Bus", amount=150, type="expense", category="Transport"),
    ])
    db.commit()

    response = client.get("/transactions/expenses-by-category")
    assert response.status_code == 200
    assert response.json() == {"Food": 500, "Transport": 150}
