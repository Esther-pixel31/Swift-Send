from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class KYC(Base, SerializationMixin):
    __tablename__ = 'kyc_doc'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_type = Column(String)
    document_number = Column(String)  # Encrypted
    file_path = Column(String)        # Just a string stub
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="kyc_docs")
