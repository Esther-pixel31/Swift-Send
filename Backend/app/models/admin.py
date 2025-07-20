# models/admin.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base, SerializationMixin
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

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

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f"<Admin {self.id} - {self.email}>"

        
