from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
from decimal import Decimal
from .base import Base, SerializationMixin
from .user import User


class PaymentRequest(Base, SerializationMixin):
    __tablename__ = "payment_requests"

    id = Column(Integer, primary_key=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requestee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(DECIMAL(precision=10, scale=2), nullable=False)
    currency = Column(String(3), nullable=False)
    note = Column(String(255))
    status = Column(String(20), default="pending")  
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requester = relationship("User", foreign_keys=[requester_id], backref="sent_requests")
    requestee = relationship("User", foreign_keys=[requestee_id], backref="received_requests")
