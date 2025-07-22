from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..models.wallet import Wallet
from ..models.user import User
from ..models.transaction import Transaction
from ..utils.spending import enforce_spending_limit
from ..db.session import SessionLocal

transfer_bp = Blueprint('transfer', __name__)

@transfer_bp.route('/domestic', methods=['POST'])
@jwt_required()
def domestic_transfer():
    data = request.get_json()
    recipient_email = data.get("recipient_email")
    amount = data.get("amount")

    if not recipient_email or not amount or amount <= 0:
        return jsonify({"msg": "Missing or invalid fields"}), 400

    sender_id = get_jwt_identity()
    session = SessionLocal()

    try:
        sender = session.query(User).get(sender_id)
        recipient = session.query(User).filter_by(email=recipient_email).first()

        if not recipient:
            return jsonify({"msg": "Recipient not found"}), 404
        if recipient.id == sender.id:
            return jsonify({"msg": "Cannot transfer to yourself"}), 400

        sender_wallet = session.query(Wallet).filter_by(user_id=sender.id).first()
        recipient_wallet = session.query(Wallet).filter_by(user_id=recipient.id).first()

        if not sender_wallet or not recipient_wallet:
            return jsonify({"msg": "Sender or recipient wallet not found"}), 404
        if sender_wallet.balance < amount:
            return jsonify({"msg": "Insufficient balance"}), 400
        ok, msg = enforce_spending_limit(wallet, amount)
        if not ok:
            return jsonify({"msg": msg}), 403
        elif msg:
            warnings.append(msg) 


        sender_wallet.balance -= amount
        recipient_wallet.balance += amount

        tx_out = Transaction(
            user_id=sender.id,
            amount=amount,
            transaction_type="transfer",
            status="success",
            currency=sender_wallet.currency
        )
        tx_in = Transaction(
            user_id=recipient.id,
            amount=amount,
            transaction_type="receive",
            status="success",
            currency=recipient_wallet.currency
        )

        session.add_all([tx_out, tx_in])
        session.commit()

        return jsonify({
            "msg": "Transfer successful",
            "amount": float(amount),
            "recipient": recipient.email,
            "warnings": warnings if warnings else None
        }), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"msg": "Transfer failed", "error": str(e)}), 500
    finally:
        session.close()
