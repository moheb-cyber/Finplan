from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from backend.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    type = Column(String, nullable=False)

    category = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )