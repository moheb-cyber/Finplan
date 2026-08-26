from backend.database import Base
from backend.models import Budget, Transaction


def test_database_metadata_contains_expected_tables():
    assert "transactions" in Base.metadata.tables
    assert "budgets" in Base.metadata.tables


def test_transaction_table_has_expected_columns():
    columns = {column.name for column in Transaction.__table__.columns}
    assert columns == {"id", "title", "amount", "type", "category", "created_at"}


def test_budget_table_has_expected_columns():
    columns = {column.name for column in Budget.__table__.columns}
    assert columns == {"id", "category", "amount", "month"}
