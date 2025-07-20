from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.wallet import Wallet
from ..models.user import User
from ..models.transaction import Transaction

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=user_id).first()

    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404

    return jsonify({
        "balance": wallet.balance,
        "currency": wallet.currency
    })

@wallet_bp.route('/wallet/deposit', methods=['POST'])
@jwt_required()
def deposit():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get("amount")

    if amount <= 0:
        return jsonify({"msg": "Invalid deposit amount"}), 400

    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404

    wallet.balance += amount
    db.session.add(wallet)

    tx = Transaction(wallet_id=wallet.id, amount=amount, type="deposit", description="Wallet deposit")
    db.session.add(tx)
    db.session.commit()

@wallet_bp.route('/wallet/transfer', methods=['POST'])
@jwt_required()
def transfer():
    user_id = get_jwt_identity()
    data = request.get_json()

    recipient_email = data.get("recipient_email")
    amount = data.get("amount")

    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400

    sender = User.query.get(user_id)
    sender_wallet = Wallet.query.filter_by(user_id=user_id).first()

    recipient = User.query.filter_by(email=recipient_email).first()
    if not recipient:
        return jsonify({"msg": "Recipient not found"}), 404

    recipient_wallet = Wallet.query.filter_by(user_id=recipient.id).first()

    if sender_wallet.balance < amount:
        return jsonify({"msg": "Insufficient funds"}), 400

    
    sender_wallet.balance -= amount
    recipient_wallet.balance += amount

    db.session.add_all([sender_wallet, recipient_wallet])

    
    sender_tx = Transaction(wallet_id=sender_wallet.id, amount=-amount, type="transfer", description=f"Sent to {recipient.email}")
    recipient_tx = Transaction(wallet_id=recipient_wallet.id, amount=amount, type="receive", description=f"Received from {sender.email}")

    db.session.add_all([sender_tx, recipient_tx])
    db.session.commit()

    return jsonify({"msg": f"Successfully sent {amount} to {recipient.email}", "new_balance": sender_wallet.balance})

