from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class Transaction(Base, SerializationMixin):
    __tablename__ = 'transactions'
   
    id = Column(Integer, primary_key=True)
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey('beneficiaries.id'), nullable=True)  

    amount = Column(Numeric, nullable=False)
    transaction_type = Column(String, nullable=False)  
    status = Column(String, default="pending")  
    currency = Column(String(10), default="KES")
    exchange_rate = Column(Float, nullable=True)
    
    scheduled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    
    user = relationship("User", back_populates="transactions")
    beneficiary = relationship("Beneficiary", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction id={self.id} user_id={self.user_id} type={self.transaction_type} amount={self.amount}>"
