# models/admin.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base, SerializationMixin
from sqlalchemy.orm import relationship

class Admin(Base, SerializationMixin):
    __tablename__ = 'admins'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    audit_logs = relationship("AuditLog", back_populates="admin")
