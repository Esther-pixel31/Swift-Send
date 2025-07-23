from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..models.wallet import Wallet
from ..models.user import User
from ..models.transaction import Transaction
from ..models.fraud_log import FraudLog
from ..utils.spending import enforce_spending_limit
from ..utils.fraud_rules import is_transaction_suspicious
from ..utils.auth import check_user_active 
from ..db.session import SessionLocal
from ..utils.auth import verified_user_required
from ..schemas import TransferSchema
from pydantic import ValidationError

transfer_bp = Blueprint('transfer', __name__)

@transfer_bp.route('/domestic', methods=['POST'])
@jwt_required()
@verified_user_required
def domestic_transfer():
    ok, user_or_response, status_code = check_user_active()
    if not ok:
        return user_or_response, status_code
    sender = user_or_response

    try:
        data = TransferSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({'msg': 'Invalid input', 'errors': e.errors()}), 400

    session = SessionLocal()
    try:
        recipient = session.query(User).filter_by(email=data.receiver_email).first()
        if not recipient:
            return jsonify({"msg": "Recipient not found"}), 404
        if recipient.id == sender.id:
            return jsonify({"msg": "Cannot transfer to yourself"}), 400

        sender_wallet = session.query(Wallet).filter_by(user_id=sender.id, currency=data.currency).first()
        recipient_wallet = session.query(Wallet).filter_by(user_id=recipient.id, currency=data.currency).first()
        if not sender_wallet or not recipient_wallet:
            return jsonify({"msg": "Wallet not found for specified currency"}), 404
        if sender_wallet.balance < data.amount:
            return jsonify({"msg": "Insufficient balance"}), 400

        # Spending limit
        ok, msg = enforce_spending_limit(sender_wallet, data.amount)
        warnings = []
        if not ok:
            return jsonify({"msg": msg}), 403
        elif msg:
            warnings.append(msg)

        # Fraud detection
        recent_transactions = session.query(Transaction).filter_by(user_id=sender.id).all()
        is_fraud, reasons = is_transaction_suspicious(sender, data.amount, recent_transactions, session)

        if is_fraud:
            reason_text = "; ".join(reasons)
            session.add(FraudLog(user_id=sender.id, reason=reason_text))
            sender.is_active = False
            print(f"[ALERT] 🚨 Suspicious transaction by {sender.email}: {reason_text}")
            session.commit()
            return jsonify({
                "msg": "Transaction flagged and blocked due to suspicious activity.",
                "reasons": reasons
            }), 403

        # Perform transfer
        sender_wallet.balance -= data.amount
        recipient_wallet.balance += data.amount

        tx_out = Transaction(
            user_id=sender.id,
            amount=data.amount,
            transaction_type="transfer",
            status="success",
            currency=data.currency,
            note=data.note
        )
        tx_in = Transaction(
            user_id=recipient.id,
            amount=data.amount,
            transaction_type="receive",
            status="success",
            currency=data.currency,
            note=data.note
        )

        session.add_all([tx_out, tx_in])
        session.commit()

        return jsonify({
            "msg": "Transfer successful",
            "amount": float(data.amount),
            "currency": data.currency,
            "recipient": recipient.email,
            "warnings": warnings if warnings else None
        }), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"msg": "Transfer failed", "error": str(e)}), 500
    finally:
        session.close()
