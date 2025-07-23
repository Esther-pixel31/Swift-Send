from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class KYC(Base, SerializationMixin):
    __tablename__ = 'kyc_docs'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_type = Column(String)
    document_number = Column(String)  
    file_path = Column(String)        
    verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    status = Column(String, default="pending")  # pending / approved / rejected
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # admin ID
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)

    user = relationship("User", back_populates="kyc_docs", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

