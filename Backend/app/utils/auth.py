# app/utils/auth.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from ..models.user import User
from ..db.session import SessionLocal
from app.exceptions import InactiveUserError
from werkzeug.security import generate_password_hash

def active_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        session = SessionLocal()
        try:
            user_id = get_jwt_identity()
            user = session.query(User).get(user_id)
            if not user:
                return jsonify({"msg": "User not found"}), 404
            if not user.is_active:
                return jsonify({"msg": "Account is suspended"}), 403
            return fn(*args, **kwargs)
        finally:
            session.close()
    return wrapper

def check_user_active(user):
    if not user.is_active:
        raise InactiveUserError("Account is inactive. Contact support.")

def hash_password(password: str) -> str:
    return generate_password_hash(password)