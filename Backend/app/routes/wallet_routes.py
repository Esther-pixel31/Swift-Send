from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..models.wallet import Wallet
from ..models.user import User
from ..db.session import SessionLocal
from ..utils.spending import enforce_spending_limit
from datetime import datetime
from ..utils.mock_notify import send_mock_notification
from decimal import Decimal, InvalidOperation

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/', strict_slashes=False, methods=['GET'])
@jwt_required()
def get_wallet():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'msg': 'Wallet not found'}), 404

        return jsonify({
            'balance': float(wallet.balance),
            'currency': wallet.currency,
        }), 200
    finally:
        session.close()

@wallet_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit_funds():
    data = request.get_json()
    try:
        amount = Decimal(str(data.get('amount')))
    except (InvalidOperation, TypeError):
        return jsonify({'msg': 'Invalid deposit amount'}), 400

    if amount <= 0:
        return jsonify({'msg': 'Invalid deposit amount'}), 400

    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'msg': 'Wallet not found'}), 404

        wallet.balance += amount
        session.commit()

        send_mock_notification(user_id, f"You deposited {amount} {wallet.currency}. New balance: {wallet.balance}")
        return jsonify({'msg': 'Deposit successful', 'new_balance': float(wallet.balance)}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({'msg': 'Deposit failed'}), 500
    finally:
        session.close()


@wallet_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw_funds():
    data = request.get_json()
    try:
        amount = Decimal(str(data.get('amount')))
    except (InvalidOperation, TypeError):
        return jsonify({'msg': 'Invalid withdrawal amount'}), 400

    if amount <= 0:
        return jsonify({'msg': 'Invalid withdrawal amount'}), 400

    user_id = get_jwt_identity()
    session = SessionLocal()
    warnings = []

    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'msg': 'Wallet not found'}), 404

        if wallet.balance < amount:
            return jsonify({'msg': 'Insufficient balance'}), 400

        ok, msg = enforce_spending_limit(wallet, amount)
        if not ok:
            return jsonify({"msg": msg}), 403
        elif msg:
            warnings.append(msg)

        wallet.balance -= amount
        session.commit()

        send_mock_notification(user_id, f"You withdrew {amount} {wallet.currency}. New balance: {wallet.balance}")

        return jsonify({
            "msg": "Withdrawal successful",
            "amount": float(amount),
            "new_balance": float(wallet.balance),
            "warnings": warnings if warnings else None
        }), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({'msg': 'Withdrawal failed'}), 500
    finally:
        session.close()


@wallet_bp.route('/set-limits', methods=['POST'])
@jwt_required()
def set_wallet_limits():
    user_id = get_jwt_identity()
    data = request.get_json()

    daily_limit = data.get("daily_limit")
    monthly_limit = data.get("monthly_limit")
    budget = data.get("budget")

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        if daily_limit is not None:
            wallet.daily_limit = daily_limit
        if monthly_limit is not None:
            wallet.monthly_limit = monthly_limit
        if budget is not None:
            wallet.budget = budget

        wallet.last_spending_reset = datetime.utcnow()
        session.commit()

        return jsonify({"msg": "Limits updated successfully"}), 200
    finally:
        session.close()
