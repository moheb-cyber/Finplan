from fastapi import APIRouter, Depends, HTTPException, Header
from backend.auth import create_token, hash_password, verify_password, verify_token
from backend.auth_models import LoginRequest, RegisterRequest
from backend.auth_store import create_user, get_user, get_user_by_email

router = APIRouter(prefix="/auth", tags=["auth"])


def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    user_id = verify_token(authorization[7:])
    user = get_user(user_id) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@router.post("/register")
def register(data: RegisterRequest):
    if get_user_by_email(data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = create_user(data.name.strip(), data.email, hash_password(data.password))
    return {"token": create_token(user_id), "user": get_user(user_id)}


@router.post("/login")
def login(data: LoginRequest):
    user = get_user_by_email(data.email)
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": create_token(user["id"]), "user": get_user(user["id"])}


@router.get("/me")
def me(user=Depends(current_user)):
    return dict(user)
