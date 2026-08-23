from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from backend.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    type = Column(String, nullable=False)

    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )