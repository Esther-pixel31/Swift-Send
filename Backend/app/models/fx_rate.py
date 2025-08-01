# models/fx_rate.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .base import Base, SerializationMixin

class FXRate(Base, SerializationMixin):
    __tablename__ = "fx_rates"

    id = Column(Integer, primary_key=True)
    base_currency = Column(String(10), nullable=False)
    target_currency = Column(String(10), nullable=False)
    rate = Column(Float, nullable=False)
    fee_percent = Column(Float, default=0.5)  
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<FXRate {self.base_currency} → {self.target_currency} @ {self.rate}>"
