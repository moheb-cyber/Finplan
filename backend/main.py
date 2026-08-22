from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from backend.database import Base, engine, SessionLocal
from backend.models import Transaction
from backend.schemas import TransactionCreate


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="FinPlan API",
    description="Personal financial planning API",
    version="1.0.0"
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
        "message": "FinPlan API is running 🚀"
    }


@app.post("/transactions")
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    new_transaction = Transaction(
        title=transaction.title,
        amount=transaction.amount,
        type=transaction.type,
        category=transaction.category
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction
@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    return transactions