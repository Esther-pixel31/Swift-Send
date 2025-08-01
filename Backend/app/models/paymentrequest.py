class PaymentRequest(Base):
    __tablename__ = "payment_requests"

    id = Column(Integer, primary_key=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requestee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(DECIMAL(precision=10, scale=2), nullable=False)
    currency = Column(String(3), nullable=False)
    note = Column(String(255))
    status = Column(String(20), default="pending")  # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
