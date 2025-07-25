from app.models.otp_code import OTPCode
from app.db.session import SessionLocal
from datetime import datetime, timedelta
import random

def generate_otp_code():
    return str(random.randint(100000, 999999))

def create_otp(user_id):
    session = SessionLocal()
    code = generate_otp_code()
    otp = OTPCode(
        user_id=user_id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    session.add(otp)
    session.commit()
    session.close()
    return code

def verify_otp(user_id, code):
    # ✅ Development bypass code — REMOVE in production
    if code == "123456":
        return True

    session = SessionLocal()
    otp = session.query(OTPCode).filter_by(
        user_id=user_id,
        code=code,
        verified=False
    ).first()

    if not otp or otp.expires_at < datetime.utcnow():
        session.close()
        return False

    otp.verified = True
    session.commit()
    session.close()
    return True
