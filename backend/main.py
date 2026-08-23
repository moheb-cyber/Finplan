from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models import Transaction
from backend.schemas import TransactionCreate


app = FastAPI(
    title="FinPlan API",
    description="Personal financial planning API",
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "FinPlan API is running"
    }


# =========================
# CREATE
# =========================

@app.post("/transactions")
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db)
):
    transaction = Transaction(
        title=transaction_data.title,
        amount=transaction_data.amount,
        type=transaction_data.type,
        category=transaction_data.category
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


# =========================
# READ ALL + FILTER
# =========================

@app.get("/transactions")
def get_transactions(
    type: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if type is not None:
        query = query.filter(Transaction.type == type)

    if category is not None:
        query = query.filter(Transaction.category == category)

    return query.all()


# =========================
# SUMMARY
# =========================

@app.get("/transactions/summary")
def get_transaction_summary(
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).all()

    total_income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.type == "income"
    )

    total_expense = sum(
        transaction.amount
        for transaction in transactions
        if transaction.type == "expense"
    )

    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    }


# =========================
# READ ONE
# =========================

@app.get("/transactions/{transaction_id}")
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


# =========================
# UPDATE
# =========================

@app.put("/transactions/{transaction_id}")
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db)
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    transaction.title = transaction_data.title
    transaction.amount = transaction_data.amount
    transaction.type = transaction_data.type
    transaction.category = transaction_data.category

    db.commit()
    db.refresh(transaction)

    return transaction


# =========================
# DELETE
# =========================

@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    db.delete(transaction)
    db.commit()

    return {
        "message": "Transaction deleted successfully"
    }