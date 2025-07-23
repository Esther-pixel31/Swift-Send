from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, SerializationMixin

class FraudLog(Base, SerializationMixin):
    __tablename__ = "fraud_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="fraud_logs")

    def __repr__(self):
        return f"<FraudLog user_id={self.user_id} reason={self.reason}>"
