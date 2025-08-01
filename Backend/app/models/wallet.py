from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Wallet(Base, SerializationMixin):
    __tablename__ = 'wallets'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    balance = Column(Numeric(12, 2), default=0.00)
    currency = Column(String(10), default="KES")
    spending_limit = Column(Numeric(12, 2), nullable=True)
    budget = Column(Numeric(12, 2), nullable=True)
    credit = Column(Numeric(precision=12, scale=2), default=0.00)
    daily_limit = Column(Numeric(12, 2), default=0.00)
    monthly_limit = Column(Numeric(12, 2), default=0.00)
    last_spending_reset = Column(DateTime, default=datetime.utcnow)
    daily_spent = Column(Numeric(12, 2), default=0.00)
    monthly_spent = Column(Numeric(12, 2), default=0.00)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

   
    user = relationship("User", back_populates="wallets", passive_deletes=True)

    def __repr__(self):
        return f"<Wallet id={self.id} user_id={self.user_id} balance={self.balance}>"
