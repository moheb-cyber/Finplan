from datetime import datetime

import pytest
from pydantic import ValidationError

from backend.schemas import (
    BudgetCreate,
    TransactionCreate,
    validate_month_format,
)


def test_valid_month_format():
    assert validate_month_format("2026-08") == "2026-08"


def test_month_format_rejects_invalid_values():
    for value in ("2026", "08-2026", "2026-13", "2026-00", "hello"):
        with pytest.raises(ValueError):
            validate_month_format(value)


def test_transaction_requires_positive_amount_and_valid_type():
    transaction = TransactionCreate(
        title="Salary",
        amount=25000000,
        type="income",
        category="Work",
    )

    assert transaction.amount == 25000000

    with pytest.raises(ValidationError):
        TransactionCreate(
            title="Salary",
            amount=0,
            type="income",
            category="Work",
        )

    with pytest.raises(ValidationError):
        TransactionCreate(
            title="Salary",
            amount=1000,
            type="transfer",
            category="Work",
        )


def test_transaction_text_fields_are_trimmed():
    transaction = TransactionCreate(
        title="  Coffee  ",
        amount=100000,
        type="expense",
        category="  Food  ",
    )

    assert transaction.title == "Coffee"
    assert transaction.category == "Food"


def test_budget_validates_month_and_positive_amount():
    budget = BudgetCreate(
        category="Food",
        amount=5000000,
        month="2026-08",
    )

    assert budget.month == "2026-08"

    with pytest.raises(ValidationError):
        BudgetCreate(
            category="Food",
            amount=-1,
            month="2026-08",
        )
