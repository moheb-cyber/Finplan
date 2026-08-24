from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# =========================
# MONTH VALIDATION
# =========================

def validate_month_format(value: str) -> str:
    value = value.strip()

    try:
        datetime.strptime(value, "%Y-%m")
    except ValueError:
        raise ValueError("month must be in YYYY-MM format")

    return value


# =========================
# TRANSACTION
# =========================

class TransactionCreate(BaseModel):
    title: str = Field(min_length=1)
    amount: int = Field(gt=0)
    type: Literal["income", "expense"]
    category: str = Field(min_length=1)

    @field_validator("title", "category")
    @classmethod
    def validate_text(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("value cannot be empty")

        return value


# =========================
# BUDGET CREATE
# =========================

class BudgetCreate(BaseModel):
    category: str = Field(min_length=1)
    amount: int = Field(gt=0)
    month: str

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("category cannot be empty")

        return value

    @field_validator("month")
    @classmethod
    def validate_month(cls, value):
        return validate_month_format(value)


# =========================
# BUDGET UPDATE
# =========================

class BudgetUpdate(BaseModel):
    category: str = Field(min_length=1)
    amount: int = Field(gt=0)
    month: str

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("category cannot be empty")

        return value

    @field_validator("month")
    @classmethod
    def validate_month(cls, value):
        return validate_month_format(value)