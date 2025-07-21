from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.wallet import Wallet
from ..db.session import SessionLocal
from datetime import datetime

mock_payments_bp = Blueprint("mock_payments", __name__)

@mock_payments_bp.route("/mock-deposit", methods=["POST"])
@jwt_required()
def mock_deposit():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get("amount")

    if not amount or amount <= 0:
        return jsonify({"msg": "Invalid deposit"}), 400

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        wallet.balance += amount
        session.commit()

        return jsonify({
            "msg": "Deposit via Stripe/M-Pesa simulated",
            "new_balance": float(wallet.balance),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    finally:
        session.close()

@mock_payments_bp.route("/mock-withdraw", methods=["POST"])
@jwt_required()
def mock_withdraw():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get("amount")

    if not amount or amount <= 0:
        return jsonify({"msg": "Invalid withdrawal amount"}), 400

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        if wallet.balance < amount:
            return jsonify({"msg": "Insufficient balance"}), 400

        wallet.balance -= amount
        session.commit()

        return jsonify({
            "msg": "Withdrawal simulated via Stripe/M-Pesa",
            "new_balance": float(wallet.balance),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    finally:
        session.close()

@mock_payments_bp.route("/mock-fail", methods=["POST"])
@jwt_required()
def mock_fail():
    return jsonify({
        "msg": "Simulated payment failure",
        "error": "Transaction declined by provider"
    }), 402  # 402 Payment Required
