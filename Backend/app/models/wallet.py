from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Wallet(Base, SerializationMixin):
    __tablename__ = 'wallets'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    balance = Column(Numeric, default=0.00)
    currency = Column(String(10), default="KES")
    spending_limit = Column(Numeric, nullable=True)
    budget = Column(Numeric, nullable=True)
    daily_limit = Column(Numeric, default=0)
    monthly_limit = Column(Numeric, default=0)
    last_spending_reset = Column(DateTime, default=datetime.utcnow)
    daily_spent = Column(Numeric(precision=12, scale=2), default=0.00)
    monthly_spent = Column(Numeric(precision=12, scale=2), default=0.00)


    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallets")

    def __repr__(self):
        return f"<Wallet id={self.id} user_id={self.user_id} balance={self.balance}>"
