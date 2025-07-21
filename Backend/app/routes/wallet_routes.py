from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..models.wallet import Wallet
from ..models.user import User
from ..db.session import SessionLocal

wallet_bp = Blueprint('wallet', __name__)

# 1. View Wallet Balance
@wallet_bp.route('/', methods=['GET'])
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

# 2. Deposit Funds
@wallet_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit_funds():
    data = request.get_json()
    amount = data.get('amount')

    if not amount or amount <= 0:
        return jsonify({'msg': 'Invalid deposit amount'}), 400

    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'msg': 'Wallet not found'}), 404

        wallet.balance += amount
        session.commit()
        return jsonify({'msg': 'Deposit successful', 'new_balance': float(wallet.balance)}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({'msg': 'Deposit failed'}), 500
    finally:
        session.close()

# 3. Withdraw Funds
@wallet_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw_funds():
    data = request.get_json()
    amount = data.get('amount')

    if not amount or amount <= 0:
        return jsonify({'msg': 'Invalid withdrawal amount'}), 400

    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({'msg': 'Wallet not found'}), 404

        if wallet.balance < amount:
            return jsonify({'msg': 'Insufficient balance'}), 400

        wallet.balance -= amount
        session.commit()
        return jsonify({'msg': 'Withdrawal successful', 'new_balance': float(wallet.balance)}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({'msg': 'Withdrawal failed'}), 500
    finally:
        session.close()
