from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Beneficiary(Base, SerializationMixin):
    __tablename__ = 'beneficiaries'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    bank_account_number = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    group = Column(String, nullable=True)  # e.g., family, friends, business
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="beneficiaries")
    transactions = relationship("Transaction", back_populates="beneficiary")
    scheduled_transfers = relationship("ScheduledTransfer", back_populates="beneficiary")


    def __repr__(self):
        return f"<Beneficiary id={self.id} name='{self.name}' phone='{self.phone_number}'>"
