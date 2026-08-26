"""Small SQLite-backed user store used until PostgreSQL migration in v2."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("finplan.db")


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    return conn


def create_user(name: str, email: str, password_hash: str):
    with connect() as conn:
        cur = conn.execute("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)", (name, email.lower().strip(), password_hash))
        conn.commit()
        return int(cur.lastrowid)


def get_user_by_email(email: str):
    with connect() as conn:
        return conn.execute("SELECT * FROM users WHERE email=?", (email.lower().strip(),)).fetchone()


def get_user(user_id: int):
    with connect() as conn:
        return conn.execute("SELECT id,name,email,created_at FROM users WHERE id=?", (user_id,)).fetchone()
