from fastapi import FastAPI, Depends, HTTPException
from backend.database import Base, engine
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Transaction, Budget
from datetime import datetime
from backend.schemas import TransactionCreate, BudgetCreate, BudgetUpdate
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinPlan API",
    description="Personal financial planning API",
)
def get_month_range(month: str):
    start_date = datetime.strptime(
        month + "-01",
        "%Y-%m-%d"
    )

    if start_date.month == 12:
        end_date = start_date.replace(
            year=start_date.year + 1,
            month=1
        )
    else:
        end_date = start_date.replace(
            month=start_date.month + 1
        )

    return start_date, end_date


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

@app.post("/budgets")
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db)
):
    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.category == budget_data.category,
            Budget.month == budget_data.month
        )
        .first()
    )

    if existing_budget is not None:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month"
        )

    budget = Budget(
        category=budget_data.category,
        amount=budget_data.amount,
        month=budget_data.month
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return budget


@app.get("/budgets")
def get_budgets(
    month: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Budget)

    if month is not None:
        query = query.filter(Budget.month == month)

    return query.all()

@app.get("/budgets/summary")
def get_budget_summary(
    month: str,
    db: Session = Depends(get_db)
):
    start_date, end_date = get_month_range(month)

    budgets = (
        db.query(Budget)
        .filter(Budget.month == month)
        .all()
    )

    result = []

    for budget in budgets:

        expenses = (
            db.query(Transaction)
            .filter(
                Transaction.type == "expense",
                Transaction.category == budget.category,
                Transaction.created_at >= start_date,
                Transaction.created_at < end_date
            )
            .all()
        )

        spent = sum(
            transaction.amount
            for transaction in expenses
        )

        remaining = budget.amount - spent

        if budget.amount > 0:
            spent_percentage = round(
                (spent / budget.amount) * 100,
                2
            )

            remaining_percentage = round(
                (remaining / budget.amount) * 100,
                2
            )
        else:
            spent_percentage = 0
            remaining_percentage = 0

        if remaining > 0:
            status = "on_track"
        elif remaining == 0:
            status = "reached"
        else:
            status = "over_budget"

        result.append({
            "category": budget.category,
            "budget": budget.amount,
            "spent": spent,
            "remaining": remaining,
            "status": status,
            "spent_percentage": spent_percentage,
            "remaining_percentage": remaining_percentage
        })

    return result

@app.put("/budgets/{budget_id}")
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db)
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id)
        .first()
    )

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.category == budget_data.category,
            Budget.month == budget_data.month,
            Budget.id != budget_id
        )
        .first()
    )

    if existing_budget is not None:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month"
        )

    budget.category = budget_data.category
    budget.amount = budget_data.amount
    budget.month = budget_data.month

    db.commit()
    db.refresh(budget)

    return budget

@app.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db)
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id)
        .first()
    )

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }

@app.get("/dashboard")
def get_dashboard(
    month: str,
    db: Session = Depends(get_db)
):
    start_date, end_date = get_month_range(month)

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.created_at >= start_date,
            Transaction.created_at < end_date
        )
        .all()
    )

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

    budgets = (
        db.query(Budget)
        .filter(Budget.month == month)
        .all()
    )

    total_budget = sum(
        budget.amount
        for budget in budgets
    )

    budget_categories = {
        budget.category
        for budget in budgets
    }

    budget_spent = sum(
        transaction.amount
        for transaction in transactions
        if (
            transaction.type == "expense"
            and transaction.category in budget_categories
        )
    )

    budget_remaining = total_budget - budget_spent

    if total_budget > 0:
        budget_spent_percentage = round(
            (budget_spent / total_budget) * 100,
            2
        )
    else:
        budget_spent_percentage = 0

    if total_budget == 0:
        budget_status = "no_budget"
    elif budget_remaining > 0:
        budget_status = "on_track"
    elif budget_remaining == 0:
        budget_status = "reached"
    else:
        budget_status = "over_budget"

    return {
        "month": month,
        "income": total_income,
        "expense": total_expense,
        "balance": balance,
        "total_budget": total_budget,
        "budget_spent": budget_spent,
        "budget_remaining": budget_remaining,
        "budget_spent_percentage": budget_spent_percentage,
        "budget_status": budget_status
    }

@app.get("/dashboard/budgets")
def get_dashboard_budgets(
    month: str,
    db: Session = Depends(get_db)
):
    start_date, end_date = get_month_range(month)

    budgets = (
        db.query(Budget)
        .filter(Budget.month == month)
        .all()
    )

    result = []

    for budget in budgets:

        expenses = (
            db.query(Transaction)
            .filter(
                Transaction.type == "expense",
                Transaction.category == budget.category,
                Transaction.created_at >= start_date,
                Transaction.created_at < end_date
            )
            .all()
        )

        spent = sum(
            transaction.amount
            for transaction in expenses
        )

        remaining = budget.amount - spent

        if budget.amount > 0:
            spent_percentage = round(
                (spent / budget.amount) * 100,
                2
            )
        else:
            spent_percentage = 0

        if remaining > 0:
            status = "on_track"
        elif remaining == 0:
            status = "reached"
        else:
            status = "over_budget"

        result.append({
            "category": budget.category,
            "budget": budget.amount,
            "spent": spent,
            "remaining": remaining,
            "spent_percentage": spent_percentage,
            "status": status
        })

    return {
        "month": month,
        "budgets": result
    }

# =========================
# READ ALL + FILTER
# =========================

@app.get("/transactions")
def get_transactions(
    type: str | None = None,
    category: str | None = None,
    date: str | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if type is not None:
        query = query.filter(Transaction.type == type)

    if category is not None:
        query = query.filter(Transaction.category == category)

    if date is not None:
        start_date = datetime.strptime(date, "%Y-%m-%d")
        end_date = datetime.strptime(date, "%Y-%m-%d").replace(
            hour=23,
            minute=59,
            second=59
        )

        query = query.filter(
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        )

    if from_date is not None:
        start_date = datetime.strptime(from_date, "%Y-%m-%d")
        query = query.filter(
            Transaction.created_at >= start_date
        )

    if to_date is not None:
        end_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
            hour=23,
            minute=59,
            second=59
        )

        query = query.filter(
            Transaction.created_at <= end_date
        )

    return query.all()


# =========================
# SUMMARY
# =========================
@app.get("/transactions/summary")
def get_transaction_summary(
    from_date: str | None = None,
    to_date: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if from_date is not None:
        start_date = datetime.strptime(from_date, "%Y-%m-%d")
        query = query.filter(
            Transaction.created_at >= start_date
        )

    if to_date is not None:
        end_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
            hour=23,
            minute=59,
            second=59
        )
        query = query.filter(
            Transaction.created_at <= end_date
        )

    transactions = query.all()

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
        "balance": balance,
        "transaction_count": len(transactions)
    }

# =========================
# READ ONE
# =========================
@app.get("/transactions/expenses-by-category")
def get_expenses_by_category(
    from_date: str | None = None,
    to_date: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(
        Transaction.type == "expense"
    )

    if from_date is not None:
        start_date = datetime.strptime(from_date, "%Y-%m-%d")
        query = query.filter(
            Transaction.created_at >= start_date
        )

    if to_date is not None:
        end_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
            hour=23,
            minute=59,
            second=59
        )
        query = query.filter(
            Transaction.created_at <= end_date
        )

    transactions = query.all()

    expenses_by_category = {}

    for transaction in transactions:
        category = transaction.category

        if category not in expenses_by_category:
            expenses_by_category[category] = 0

        expenses_by_category[category] += transaction.amount

    return expenses_by_category

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