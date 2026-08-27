"""Authentication helpers for FinPlan v1."""
from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
import base64
import hmac
import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

SECRET_VALUE = os.getenv("FINPLAN_AUTH_SECRET")
if not SECRET_VALUE:
    raise RuntimeError("FINPLAN_AUTH_SECRET must be set in the environment")
SECRET = SECRET_VALUE.encode()
TOKEN_TTL_HOURS = int(os.getenv("FINPLAN_TOKEN_TTL_HOURS", "24"))


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return base64.urlsafe_b64encode(salt + digest).decode()


def verify_password(password: str, encoded: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(encoded.encode())
        salt, expected = raw[:16], raw[16:]
        actual = pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def create_token(user_id: int) -> str:
    expires = int((datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)).timestamp())
    payload = f"{user_id}.{expires}".encode()
    signature = hmac.new(SECRET, payload, "sha256").digest()
    return base64.urlsafe_b64encode(payload + b"." + signature).decode()


def verify_token(token: str) -> int | None:
    try:
        raw = base64.urlsafe_b64decode(token.encode())
        payload, signature = raw.rsplit(b".", 1)
        if not hmac.compare_digest(signature, hmac.new(SECRET, payload, "sha256").digest()):
            return None
        user_id, expires = payload.decode().split(".")
        if int(expires) < int(datetime.now(timezone.utc).timestamp()):
            return None
        return int(user_id)
    except Exception:
        return None
