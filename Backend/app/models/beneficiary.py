# models/beneficiary.py
from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin



class Beneficiary(Base, SerializationMixin):
    __tablename__ = 'beneficiaries'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String)
    phone_number = Column(String)
    bank_account_number = Column(String)
    bank_name = Column(String)
    group = Column(String)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="beneficiaries")
    transactions = relationship("Transaction", back_populates="beneficiary")
