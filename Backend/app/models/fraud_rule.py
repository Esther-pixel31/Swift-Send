from sqlalchemy import Column, Integer, String, Boolean, Text
from .base import Base, SerializationMixin # Already includes SerializationMixin

class FraudRule(Base, SerializationMixin):
    __tablename__ = "fraud_rules"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    key = Column(String(100), nullable=False)
    value = Column(String(100), nullable=False)
    active = Column(Boolean, default=True)