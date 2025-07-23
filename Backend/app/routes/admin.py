# app/routes/admin.py or app/routes/fraud.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.fraud_log import FraudLog
from ..models.user import User
from ..db.session import SessionLocal
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session = SessionLocal()
        user_id = get_jwt_identity()
        user = session.query(User).get(user_id)
        if not user or user.role != 'admin':
            session.close()
            return jsonify({"msg": "Admin access required"}), 403
        session.close()
        return func(*args, **kwargs)
    return wrapper


@admin_bp.route('/fraud/logs', methods=['GET'])
@jwt_required()
@admin_required
def get_fraud_logs():
    session = SessionLocal()
    user_id = get_jwt_identity()
    user = session.query(User).get(user_id)

    if user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    logs = session.query(FraudLog).order_by(FraudLog.created_at.desc()).all()
    session.close()
    return jsonify([log.serialize() for log in logs]), 200

@admin_bp.route('/users/<int:user_id>/reactivate', methods=['POST'])
@jwt_required()
@admin_required
def reactivate_user(user_id):
    session = SessionLocal()
    admin_id = get_jwt_identity()
    admin = session.query(User).get(admin_id)

    if admin.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    user = session.query(User).get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.is_active = True
    session.commit()
    session.close()
    return jsonify({"msg": f"User {user.email} reactivated"}), 200
