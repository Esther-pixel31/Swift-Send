# models/transaction.py
from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Transaction(Base, SerializationMixin):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    beneficiary_id = Column(Integer, ForeignKey('beneficiaries.id'))
    amount = Column(Numeric)
    transaction_type = Column(String)
    status = Column(String)
    currency = Column(String)
    exchange_rate = Column(Float)
    scheduled_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    beneficiary = relationship("Beneficiary", back_populates="transactions")
