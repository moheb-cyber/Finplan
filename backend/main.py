from datetime import datetime
from pathlib import Path
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from backend.database import SessionLocal, ensure_schema
from backend.models import Transaction, Budget
from backend.schemas import TransactionCreate, TransactionResponse, BudgetCreate, BudgetResponse, BudgetUpdate, DashboardResponse, validate_month_format
from backend.auth_router import router as auth_router, current_user

ensure_schema()
app = FastAPI(title="FinPlan API", description="Personal financial planning API")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:8000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

@app.get("/", include_in_schema=False)
def root(): return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/app", include_in_schema=False)
def serve_app(): return FileResponse(FRONTEND_DIR / "index.html")

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

def get_month_range(month: str):
    start = datetime.strptime(month + "-01", "%Y-%m-%d")
    end = start.replace(year=start.year + 1, month=1) if start.month == 12 else start.replace(month=start.month + 1)
    return start, end

def validate_month_query(month: str) -> str:
    return validate_month_format(month)

def parse_date_filter(value: str | None, field: str) -> datetime | None:
    if value is None:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail=f"{field} must be in YYYY-MM-DD format")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def uid(user): return int(user.id)

@app.post("/transactions", response_model=TransactionResponse)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db), user=Depends(current_user)):
    item = Transaction(user_id=uid(user), title=data.title, amount=data.amount, type=data.type, category=data.category)
    db.add(item); db.commit(); db.refresh(item); return item

@app.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(type: str | None = None, category: str | None = None, date: str | None = None, from_date: str | None = None, to_date: str | None = None, db: Session = Depends(get_db), user=Depends(current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == uid(user))
    if type and type not in {"income", "expense"}: raise HTTPException(422, "type must be income or expense")
    if type: q = q.filter(Transaction.type == type)
    if category: q = q.filter(Transaction.category == category)
    if date:
        s = parse_date_filter(date, "date"); q = q.filter(Transaction.created_at >= s, Transaction.created_at <= s.replace(hour=23, minute=59, second=59))
    if from_date:
        s = parse_date_filter(from_date, "from_date"); q = q.filter(Transaction.created_at >= s)
    if to_date:
        e = parse_date_filter(to_date, "to_date"); q = q.filter(Transaction.created_at <= e.replace(hour=23, minute=59, second=59))
    return q.order_by(Transaction.created_at.desc()).all()

@app.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, data: TransactionCreate, db: Session = Depends(get_db), user=Depends(current_user)):
    item = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == uid(user)).first()
    if not item: raise HTTPException(404, "Transaction not found")
    item.title = data.title; item.amount = data.amount; item.type = data.type; item.category = data.category
    db.commit(); db.refresh(item); return item

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), user=Depends(current_user)):
    item = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == uid(user)).first()
    if not item: raise HTTPException(404, "Transaction not found")
    db.delete(item); db.commit(); return {"message": "Transaction deleted successfully"}

@app.post("/budgets", response_model=BudgetResponse)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db), user=Depends(current_user)):
    if db.query(Budget).filter(Budget.user_id == uid(user), Budget.category == data.category, Budget.month == data.month).first():
        raise HTTPException(409, "Budget already exists for this category and month")
    item = Budget(user_id=uid(user), category=data.category, amount=data.amount, month=data.month)
    db.add(item); db.commit(); db.refresh(item); return item

@app.get("/budgets", response_model=list[BudgetResponse])
def get_budgets(month: str | None = None, db: Session = Depends(get_db), user=Depends(current_user)):
    if month: month = validate_month_format(month)
    q = db.query(Budget).filter(Budget.user_id == uid(user))
    if month: q = q.filter(Budget.month == month)
    return q.order_by(Budget.month.desc(), Budget.category.asc()).all()

@app.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, data: BudgetUpdate, db: Session = Depends(get_db), user=Depends(current_user)):
    item = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == uid(user)).first()
    if not item: raise HTTPException(404, "Budget not found")
    duplicate = db.query(Budget).filter(Budget.user_id == uid(user), Budget.category == data.category, Budget.month == data.month, Budget.id != budget_id).first()
    if duplicate: raise HTTPException(409, "Budget already exists for this category and month")
    item.category = data.category; item.amount = data.amount; item.month = data.month
    db.commit(); db.refresh(item); return item

@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), user=Depends(current_user)):
    item = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == uid(user)).first()
    if not item: raise HTTPException(404, "Budget not found")
    db.delete(item); db.commit(); return {"message": "Budget deleted successfully"}

@app.get("/dashboard", response_model=DashboardResponse)
def dashboard(month: str = Depends(validate_month_query), db: Session = Depends(get_db), user=Depends(current_user)):
    u = uid(user); s, e = get_month_range(month)
    ts = db.query(Transaction).filter(Transaction.user_id == u, Transaction.created_at >= s, Transaction.created_at < e).all()
    income = sum(t.amount for t in ts if t.type == "income"); expense = sum(t.amount for t in ts if t.type == "expense")
    budgets = db.query(Budget).filter(Budget.user_id == u, Budget.month == month).all(); total = sum(b.amount for b in budgets)
    cats = {b.category for b in budgets}; spent = sum(t.amount for t in ts if t.type == "expense" and t.category in cats); remaining = total - spent
    pct = round(spent / total * 100, 2) if total else 0
    status = "no_budget" if not total else "on_track" if remaining > 0 else "reached" if remaining == 0 else "over_budget"
    return {"month": month, "income": income, "expense": expense, "balance": income - expense, "total_budget": total, "budget_spent": spent, "budget_remaining": remaining, "budget_spent_percentage": pct, "budget_status": status}

@app.get("/dashboard/budgets")
def dashboard_budgets(month: str = Depends(validate_month_query), db: Session = Depends(get_db), user=Depends(current_user)):
    u = uid(user); s, e = get_month_range(month); out = []
    for b in db.query(Budget).filter(Budget.user_id == u, Budget.month == month).all():
        spent = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == u, Transaction.type == "expense", Transaction.category == b.category, Transaction.created_at >= s, Transaction.created_at < e).all())
        rem = b.amount - spent; out.append({"category": b.category, "budget": b.amount, "spent": spent, "remaining": rem, "spent_percentage": round(spent / b.amount * 100, 2) if b.amount else 0, "status": "on_track" if rem > 0 else "reached" if rem == 0 else "over_budget"})
    return {"month": month, "budgets": out}

@app.get("/transactions/summary")
def transaction_summary(from_date: str | None = None, to_date: str | None = None, db: Session = Depends(get_db), user=Depends(current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == uid(user))
    if from_date:
        s = parse_date_filter(from_date, "from_date"); q = q.filter(Transaction.created_at >= s)
    if to_date:
        e = parse_date_filter(to_date, "to_date"); q = q.filter(Transaction.created_at <= e.replace(hour=23, minute=59, second=59))
    ts = q.all(); i = sum(t.amount for t in ts if t.type == "income"); e = sum(t.amount for t in ts if t.type == "expense")
    return {"total_income": i, "total_expense": e, "balance": i - e, "transaction_count": len(ts)}

@app.get("/transactions/expenses-by-category")
def expenses_by_category(from_date: str | None = None, to_date: str | None = None, db: Session = Depends(get_db), user=Depends(current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == uid(user), Transaction.type == "expense")
    if from_date:
        s = parse_date_filter(from_date, "from_date"); q = q.filter(Transaction.created_at >= s)
    if to_date:
        e = parse_date_filter(to_date, "to_date"); q = q.filter(Transaction.created_at <= e.replace(hour=23, minute=59, second=59))
    out = {}
    for t in q.all(): out[t.category] = out.get(t.category, 0) + t.amount
    return out

@app.get("/budgets/summary")
def budget_summary(month: str = Depends(validate_month_query), db: Session = Depends(get_db), user=Depends(current_user)):
    u = uid(user); s, e = get_month_range(month); out = []
    for b in db.query(Budget).filter(Budget.user_id == u, Budget.month == month).all():
        spent = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == u, Transaction.type == "expense", Transaction.category == b.category, Transaction.created_at >= s, Transaction.created_at < e).all())
        rem = b.amount - spent; out.append({"category": b.category, "budget": b.amount, "spent": spent, "remaining": rem, "status": "on_track" if rem > 0 else "reached" if rem == 0 else "over_budget", "spent_percentage": round(spent / b.amount * 100, 2) if b.amount else 0, "remaining_percentage": round(rem / b.amount * 100, 2) if b.amount else 0})
    return out
