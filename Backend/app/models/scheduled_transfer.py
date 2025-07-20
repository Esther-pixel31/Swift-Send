from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class ScheduledTransfer(Base, SerializationMixin):
    __tablename__ = 'scheduled_transfers'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey('beneficiaries.id'), nullable=False)
    
    amount = Column(Numeric, nullable=False)
    currency = Column(String(10), default="KES")
    
    scheduled_at = Column(DateTime, nullable=False)  # when to execute
    recurrence = Column(String, nullable=True)  # e.g., daily, weekly, monthly
    is_active = Column(Boolean, default=True)

    status = Column(String, default="pending")  # pending, processed, failed
    last_attempt_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="scheduled_transfers")
    beneficiary = relationship("Beneficiary", back_populates="scheduled_transfers")

    def __repr__(self):
        return f"<ScheduledTransfer id={self.id} to={self.beneficiary_id} at={self.scheduled_at}>"
