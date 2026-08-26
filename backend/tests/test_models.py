from datetime import datetime

from backend.models import Budget, Transaction


def test_transaction_model_defaults_and_fields():
    transaction = Transaction(
        title="Coffee",
        amount=120000,
        type="expense",
        category="Food",
    )

    assert transaction.title == "Coffee"
    assert transaction.amount == 120000
    assert transaction.type == "expense"
    assert transaction.category == "Food"
    assert transaction.created_at is None


def test_budget_model_fields():
    budget = Budget(category="Food", amount=5000000, month="2026-08")

    assert budget.category == "Food"
    assert budget.amount == 5000000
    assert budget.month == "2026-08"
