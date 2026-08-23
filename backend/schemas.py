from pydantic import BaseModel


class TransactionCreate(BaseModel):
    title: str
    amount: float
    type: str
    category: str


class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str

class BudgetUpdate(BaseModel):
    category: str
    amount: float
    month: str