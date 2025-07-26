# app/utils/logger.py
from ..models.audit_log import AuditLog
from ..db.session import SessionLocal

def log_action(user_id=None, admin_id=None, action="", description="", ip_address=None):
    session = SessionLocal()
    try:
        log = AuditLog(
            user_id=user_id,
            admin_id=admin_id,
            action=action,
            description=description,
            ip_address=ip_address
        )
        session.add(log)
        session.commit()
    except Exception as e:
        print(f"[AuditLog Error] {e}")
        session.rollback()
    finally:
        session.close()
