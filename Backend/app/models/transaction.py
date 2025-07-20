
from ..extensions import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    type = db.Column(db.String(20)) 
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    wallet = db.relationship("Wallet", backref="transactions")

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

