from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .base import Base, SerializationMixin

class User(Base, SerializationMixin):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")
    card_number = Column(String(16), unique=True, nullable=True)
    card_expiry = Column(String(5), nullable=True)
    card_cvc = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)

    #2FA and security features 
    otp_secret = Column(String, nullable=True)
    otp_verified = Column(Boolean, default=False)
    biometric_enabled = Column(Boolean, default=False)
    
    kyc_status = Column(String, default="not_started")  
    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    wallets = relationship("Wallet", back_populates="user")
    beneficiaries = relationship("Beneficiary", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    scheduled_transfers = relationship("ScheduledTransfer", back_populates="user")
    kyc_docs = relationship("KYC", back_populates="user", foreign_keys="[KYC.user_id]")
    support_tickets = relationship("SupportTicket", back_populates="user")
    fraud_logs = relationship("FraudLog", back_populates="user")
    reviewed_docs = relationship("KYC", back_populates="reviewer", foreign_keys="[KYC.reviewed_by]")


    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
