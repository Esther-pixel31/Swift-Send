# models/otp_code.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from datetime import datetime, timedelta
from .base import Base, SerializationMixin

class OTPCode(Base, SerializationMixin):
    __tablename__ = 'otp_codes'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
