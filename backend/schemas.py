from pydantic import BaseModel


class TransactionCreate(BaseModel):
    title: str
    amount: float
    type: str
    category: str