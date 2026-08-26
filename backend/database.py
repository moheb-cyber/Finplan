from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = DATA_DIR / "finplan.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_schema() -> None:
    """Create tables and safely migrate nullable auth columns in old SQLite DBs."""
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    migrations = {
        "transactions": [("user_id", "INTEGER REFERENCES users(id)")],
        "budgets": [("user_id", "INTEGER REFERENCES users(id)")],
    }
    with engine.begin() as connection:
        for table, columns in migrations.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, definition in columns:
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {definition}"))


ensure_schema()
