
from ..extensions import db
from datetime import datetime

class Wallet(db.Model):
    __tablename__ = 'wallets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(10), default="KES")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="wallet", uselist=False)

# models/wallet.py
from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Wallet(Base, SerializationMixin):
    __tablename__ = 'wallets'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    balance = Column(Numeric, default=0.00)
    currency = Column(String)
    spending_limit = Column(Numeric)
    budget = Column(Numeric)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallets")

