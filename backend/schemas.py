from pydantic import BaseModel, Field
from typing import Literal


class TransactionCreate(BaseModel):
    title: str = Field(min_length=1)
    amount: float = Field(gt=0)
    type: Literal["income", "expense"]
    category: str = Field(min_length=1)


class BudgetCreate(BaseModel):
    category: str = Field(min_length=1)
    amount: float = Field(gt=0)
    month: str


class BudgetUpdate(BaseModel):
    category: str = Field(min_length=1)
    amount: float = Field(gt=0)
    month: str