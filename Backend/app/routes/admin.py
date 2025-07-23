# app/routes/admin.py or app/routes/fraud.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.fraud_log import FraudLog
from ..models.user import User
from ..db.session import SessionLocal
from functools import wraps
from ..utils.auth import admin_required

admin_bp = Blueprint('admin', __name__)

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

@admin_bp.route('/kyc/approve/<int:kyc_id>', methods=['POST'])
@jwt_required()
@admin_required
def approve_kyc(kyc_id):
    session = SessionLocal()
    try:
        kyc_doc = session.query(KYC).get(kyc_id)
        if not kyc_doc:
            return jsonify({"msg": "KYC document not found"}), 404

        if kyc_doc.status == 'approved':
            return jsonify({"msg": "Already approved"}), 400

        kyc_doc.status = 'approved'
        kyc_doc.reviewed_by = get_jwt_identity()
        kyc_doc.reviewed_at = datetime.utcnow()

        user = session.query(User).get(kyc_doc.user_id)
        user.kyc_status = 'approved'
        user.is_verified = True

        session.commit()
        return jsonify({"msg": "KYC approved"}), 200
    finally:
        session.close()

@admin_bp.route('/kyc/reject/<int:kyc_id>', methods=['POST'])
@jwt_required()
@admin_required
def reject_kyc(kyc_id):
    data = request.get_json()
    reason = data.get("reason", "Not specified")

    session = SessionLocal()
    try:
        kyc_doc = session.query(KYC).get(kyc_id)
        if not kyc_doc:
            return jsonify({"msg": "KYC document not found"}), 404

        if kyc_doc.status == 'rejected':
            return jsonify({"msg": "Already rejected"}), 400

        kyc_doc.status = 'rejected'
        kyc_doc.reviewed_by = get_jwt_identity()
        kyc_doc.reviewed_at = datetime.utcnow()
        kyc_doc.rejection_reason = reason

        user = session.query(User).get(kyc_doc.user_id)
        user.kyc_status = 'rejected'
        user.is_verified = False

        session.commit()
        return jsonify({"msg": "KYC rejected", "reason": reason}), 200
    finally:
        session.close()

@admin_bp.route('/kyc/pending', methods=['GET'])
@jwt_required()
@admin_required
def list_pending_kycs():
    session = SessionLocal()
    try:
        pending_docs = session.query(KYC).filter_by(status='pending').all()
        return jsonify([doc.to_dict() for doc in pending_docs]), 200
    finally:
        session.close()
