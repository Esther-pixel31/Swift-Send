# app/routes/admin.py or app/routes/fraud.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.fraud_log import FraudLog
from ..models.user import User
from ..db.session import SessionLocal
from functools import wraps
from ..utils.auth import admin_required
from ..models.wallet import Wallet 
from sqlalchemy import func
from ..models.transaction import Transaction
from ..utils.logger import log_action
from ..models.fx_rate import FXRate
from ..models.audit_log import AuditLog
from ..models.support_ticket import SupportTicket
from ..models.kyc import KYC

admin_bp = Blueprint('admin', __name__)

VALID_STATUSES = {"open", "in_progress", "resolved"}

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
        admin_id = get_jwt_identity()
        kyc_doc.reviewed_by = admin_id
        kyc_doc.reviewed_at = datetime.utcnow()

        user = session.query(User).get(kyc_doc.user_id)
        user.kyc_status = 'approved'
        user.is_verified = True

        session.commit()

        log_action(
            admin_id=admin_id,
            user_id=user.id,
            action="KYC_APPROVED",
            description=f"KYC approved for user {user.email}"
        )

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


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    session = SessionLocal()
    try:
        users = session.query(User).all()
        return jsonify([{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_active": u.is_active,
            "kyc_status": u.kyc_status,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat()
        } for u in users]), 200
    finally:
        session.close()

 # make sure it's imported

@admin_bp.route('/wallets', methods=['GET'])
@jwt_required()
@admin_required
def get_all_wallets():
    session = SessionLocal()
    try:
        wallets = session.query(Wallet).all()
        return jsonify([{
            "id": w.id,
            "user_id": w.user_id,
            "balance": float(w.balance),
            "currency": w.currency,
            "daily_limit": float(w.daily_limit or 0),
            "monthly_limit": float(w.monthly_limit or 0),
            "budget": float(w.budget or 0)
        } for w in wallets]), 200
    finally:
        session.close()



@admin_bp.route('/dashboard/metrics', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_metrics():
    session = SessionLocal()
    try:
        total_users = session.query(func.count(User.id)).scalar()
        verified_users = session.query(func.count(User.id)).filter_by(is_verified=True).scalar()
        total_balance = session.query(func.sum(Wallet.balance)).scalar() or 0
        transfers_this_month = session.query(func.count(Transaction.id))\
            .filter(Transaction.created_at >= datetime.utcnow().replace(day=1)).scalar()

        return jsonify({
            "total_users": total_users,
            "verified_users": verified_users,
            "total_wallet_balance": float(total_balance),
            "monthly_transfers": transfers_this_month
        }), 200
    finally:
        session.close()

# In app/routes/admin.py


@admin_bp.route('/fx-rates', methods=['GET'])
@jwt_required()
@admin_required
def list_fx_rates():
    session = SessionLocal()
    try:
        rates = session.query(FXRate).all()
        return jsonify([r.serialize() for r in rates]), 200
    finally:
        session.close()

@admin_bp.route('/fx-rates', methods=['POST'])
@jwt_required()
@admin_required
def create_fx_rate():
    data = request.get_json()
    session = SessionLocal()
    try:
        fx = FXRate(
            base_currency=data["base_currency"],
            target_currency=data["target_currency"],
            rate=data["rate"],
            fee_percent=data.get("fee_percent", 0.0)
        )
        session.add(fx)
        session.commit()
        return jsonify({"msg": "FX rate created", "id": fx.id}), 201
    finally:
        session.close()

@admin_bp.route('/fx-rates/<int:fx_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_fx_rate(fx_id):
    data = request.get_json()
    session = SessionLocal()
    try:
        fx = session.query(FXRate).get(fx_id)
        if not fx:
            return jsonify({"msg": "FX rate not found"}), 404

        fx.rate = data.get("rate", fx.rate)
        fx.fee_percent = data.get("fee_percent", fx.fee_percent)
        session.commit()
        return jsonify({"msg": "FX rate updated"}), 200
    finally:
        session.close()

@admin_bp.route('/fx-rates/<int:fx_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_fx_rate(fx_id):
    session = SessionLocal()
    try:
        fx = session.query(FXRate).get(fx_id)
        if not fx:
            return jsonify({"msg": "FX rate not found"}), 404

        session.delete(fx)
        session.commit()
        return jsonify({"msg": "FX rate deleted"}), 200
    finally:
        session.close()

@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required
def get_audit_logs():
    session = SessionLocal()
    try:
        logs = session.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
        return jsonify([log.serialize() for log in logs]), 200
    finally:
        session.close()

@admin_bp.route('/kyc/<int:kyc_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_kyc(kyc_id):
    session = SessionLocal()
    try:
        kyc = session.query(KYC).get(kyc_id)
        if not kyc:
            return jsonify({"msg": "KYC document not found"}), 404

        session.delete(kyc)
        session.commit()
        return jsonify({"msg": "KYC document deleted"}), 200
    finally:
        session.close()

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    session = SessionLocal()
    data = request.get_json()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        user.role = data.get("role", user.role)
        user.is_active = data.get("is_active", user.is_active)

        session.commit()
        return jsonify({"msg": "User updated"}), 200
    finally:
        session.close()


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        session.delete(user)
        session.commit()
        return jsonify({"msg": "User deleted"}), 200
    finally:
        session.close()

@admin_bp.route('/wallets/<int:wallet_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_wallet(wallet_id):
    data = request.get_json()
    session = SessionLocal()
    try:
        wallet = session.query(Wallet).get(wallet_id)
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        # Optional fields
        wallet.balance = data.get("balance", wallet.balance)
        wallet.daily_limit = data.get("daily_limit", wallet.daily_limit)
        wallet.monthly_limit = data.get("monthly_limit", wallet.monthly_limit)
        wallet.budget = data.get("budget", wallet.budget)

        session.commit()
        return jsonify({"msg": "Wallet updated"}), 200
    finally:
        session.close()

@admin_bp.route('/wallets/<int:wallet_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_wallet(wallet_id):
    session = SessionLocal()
    try:
        wallet = session.query(Wallet).get(wallet_id)
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        session.delete(wallet)
        session.commit()
        return jsonify({"msg": "Wallet deleted"}), 200
    finally:
        session.close()

@admin_bp.route("/support/tickets", methods=["GET"])
@jwt_required()
@admin_required
def list_all_tickets():
    session = SessionLocal()
    tickets = session.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    output = []
    for t in tickets:
        ticket_data = t.serialize()
        ticket_data["user_email"] = t.user.email  # 👈 Add this
        output.append(ticket_data)
    session.close()
    return jsonify(output), 200


@admin_bp.route("/support/tickets/<int:ticket_id>", methods=["PUT"])
@jwt_required()
@admin_required
def respond_to_ticket(ticket_id):
    data = request.get_json()
    status = data.get("status")
    response = data.get("response")

    session = SessionLocal()
    ticket = session.query(SupportTicket).get(ticket_id)

    if not ticket:
        session.close()
        return jsonify({"msg": "Ticket not found"}), 404

    if status:
        if status not in VALID_STATUSES:
            session.close()
            return jsonify({"msg": "Invalid status"}), 400
        ticket.status = status

    if response:
        ticket.response = response

    session.commit()

    # 🟢 Mock notification
    from app.utils.mock_notify import send_mock_notification
    send_mock_notification(ticket.user_id, f"Your ticket '{ticket.subject}' has been updated: {status or 'response added'}")

    session.close()
    return jsonify({"msg": "Ticket updated"}), 200