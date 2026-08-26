from backend.database import SessionLocal
from backend.models import User


def create_user(name: str, email: str, password_hash: str):
    db = SessionLocal()
    try:
        user = User(name=name.strip(), email=email.lower().strip(), password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user.id
    finally:
        db.close()


def get_user_by_email(email: str):
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email.lower().strip()).first()
    finally:
        db.close()


def get_user(user_id: int):
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()
