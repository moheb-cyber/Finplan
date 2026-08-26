from datetime import datetime

import pytest
from pydantic import ValidationError

from backend.schemas import (
    BudgetCreate,
    BudgetUpdate,
    TransactionCreate,
    validate_month_format,
)


def test_valid_month_format():
    assert validate_month_format("2026-08") == "2026-08"
    assert validate_month_format(" 2026-08 ") == "2026-08"


def test_month_format_rejects_invalid_values():
    for value in ("2026", "08-2026", "2026-13", "2026-00", "hello", ""):
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


def test_transaction_rejects_blank_text_fields():
    with pytest.raises(ValidationError):
        TransactionCreate(
            title="   ",
            amount=1000,
            type="expense",
            category="Food",
        )

    with pytest.raises(ValidationError):
        TransactionCreate(
            title="Coffee",
            amount=1000,
            type="expense",
            category="   ",
        )


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


def test_budget_category_is_trimmed_and_cannot_be_blank():
    budget = BudgetCreate(
        category="  Food  ",
        amount=5000000,
        month=" 2026-08 ",
    )

    assert budget.category == "Food"
    assert budget.month == "2026-08"

    with pytest.raises(ValidationError):
        BudgetCreate(
            category="   ",
            amount=5000000,
            month="2026-08",
        )


def test_budget_update_has_same_validation_rules():
    budget = BudgetUpdate(
        category="  Transport ",
        amount=3000000,
        month=" 2026-09 ",
    )

    assert budget.category == "Transport"
    assert budget.amount == 3000000
    assert budget.month == "2026-09"

    with pytest.raises(ValidationError):
        BudgetUpdate(
            category="Transport",
            amount=0,
            month="2026-09",
        )
