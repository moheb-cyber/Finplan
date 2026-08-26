import pytest
from pydantic import ValidationError

from backend.schemas import BudgetCreate, TransactionCreate


def test_month_validation_accepts_valid_boundaries():
    from backend.schemas import validate_month_format

    assert validate_month_format("2000-01") == "2000-01"
    assert validate_month_format("2099-12") == "2099-12"


def test_transaction_rejects_negative_amount():
    with pytest.raises(ValidationError):
        TransactionCreate(
            title="Test",
            amount=-100,
            type="expense",
            category="Other",
        )


def test_budget_rejects_zero_amount():
    with pytest.raises(ValidationError):
        BudgetCreate(
            category="Other",
            amount=0,
            month="2026-08",
        )
