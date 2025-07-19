# models/audit_log.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class AuditLog(Base, SerializationMixin):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    admin_id = Column(Integer, ForeignKey('admins.id'))
    action = Column(String)
    description = Column(Text)
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
    admin = relationship("Admin", back_populates="audit_logs")
