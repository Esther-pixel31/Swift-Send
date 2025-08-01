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
from ..utils.mock_notify import send_mock_notification
from ..models.fx_rate import FXRate
from ..schema.transfer import TransferSchema

from ..models.user import User

transfer_bp = Blueprint('transfer', __name__)

@transfer_bp.route('/domestic', methods=['POST'])
@jwt_required()
@verified_user_required
def domestic_transfer():
    session = SessionLocal()
    try:
        user_id = get_jwt_identity()
        sender = session.query(User).get(user_id)
        if not sender:
            return jsonify({"msg": "User not found"}), 404

        try:
            check_user_active(sender)
        except InactiveUserError as e:
            return jsonify({"msg": str(e)}), 403

        try:
            data = TransferSchema(**request.get_json())
        except ValidationError as e:
            return jsonify({'msg': 'Invalid input', 'errors': e.errors()}), 400

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

        # Spending limit check
        ok, msg = enforce_spending_limit(sender_wallet, data.amount)
        warnings = []
        if not ok:
            return jsonify({"msg": msg}), 403
        elif msg:
            warnings.append(msg)

        # Fraud detection
        
        is_fraud, reasons = is_transaction_suspicious(sender, data.amount, session)
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

        send_mock_notification(sender.id, f"You sent {data.amount} {sender_wallet.currency} to {recipient.email}")
        send_mock_notification(recipient.id, f"You received {data.amount} {recipient_wallet.currency} from {sender.email}")

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


@transfer_bp.route('/schedule', methods=['POST'])
@jwt_required()
@verified_user_required
def schedule_transfer():
    user_id = get_jwt_identity()
    data = request.get_json()
    session = SessionLocal()
    
    required_fields = ['beneficiary_id', 'amount', 'currency', 'scheduled_at']
    if not all(field in data for field in required_fields):
        return jsonify({'msg': 'Missing required fields'}), 400

    try:
        scheduled_at = datetime.fromisoformat(data['scheduled_at'])

        st = ScheduledTransfer(
            user_id=user_id,
            beneficiary_id=data['beneficiary_id'],
            amount=data['amount'],
            currency=data['currency'],
            scheduled_at=scheduled_at,
            recurrence=data.get('recurrence'),  # Optional: daily, weekly, monthly
            is_active=True
        )
        session.add(st)
        session.commit()
        return jsonify({"msg": "Scheduled transfer created"}), 201
    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Failed to schedule transfer", "error": str(e)}), 500
    finally:
        session.close()

@transfer_bp.route('/scheduled', methods=['GET'])
@jwt_required()
def get_scheduled_transfers():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        transfers = session.query(ScheduledTransfer)\
            .filter_by(user_id=user_id)\
            .order_by(ScheduledTransfer.scheduled_at.desc())\
            .all()
        return jsonify([tx.serialize() for tx in transfers]), 200
    finally:
        session.close()

@transfer_bp.route('/scheduled/<int:transfer_id>', methods=['DELETE'])
@jwt_required()
def cancel_scheduled_transfer(transfer_id):
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        transfer = session.query(ScheduledTransfer).filter_by(id=transfer_id, user_id=user_id).first()
        if not transfer:
            return jsonify({"msg": "Scheduled transfer not found"}), 404

        transfer.is_active = False
        session.commit()
        return jsonify({"msg": "Scheduled transfer canceled"}), 200
    finally:
        session.close()

# routes/transfer.py
@transfer_bp.route('/international', methods=['POST'])
@jwt_required()
@verified_user_required
def international_transfer():
    session = SessionLocal()
    try:
        # ✅ Get current user
        user_id = get_jwt_identity()
        sender = session.query(User).filter_by(id=user_id).first()
        if not sender:
            return jsonify({"msg": "User not found"}), 404

        # ✅ Check if user is active
        try:
            check_user_active(sender)
        except InactiveUserError as e:
            return jsonify({"msg": str(e)}), 403


        # ✅ Validate request data
        try:
            data = TransferSchema(**request.get_json())
        except ValidationError as e:
            return jsonify({"msg": "Invalid input", "errors": e.errors()}), 400

        # ✅ Get recipient user
        recipient = session.query(User).filter_by(email=data.receiver_email).first()
        if not recipient:
            return jsonify({"msg": "Recipient not found"}), 404
        if recipient.id == sender.id:
            return jsonify({"msg": "Cannot transfer to yourself"}), 400

        # ✅ Get wallets
        sender_wallet = session.query(Wallet).filter_by(user_id=sender.id).first()
        recipient_wallet = session.query(Wallet).filter_by(user_id=recipient.id).first()
        if not sender_wallet or not recipient_wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        # ✅ FX rate lookup
        fx = session.query(FXRate).filter_by(
            base_currency=sender_wallet.currency,
            target_currency=recipient_wallet.currency
        ).first()
        if not fx:
            return jsonify({"msg": "Exchange rate not found"}), 400

        # ✅ Fee + total deduction
        fee = float(data.amount) * (fx.fee_percent / 100)
        total_deduct = float(data.amount) + fee
        if sender_wallet.balance < total_deduct:
            return jsonify({"msg": "Insufficient balance (with FX fee)"}), 400

        converted_amount = float(data.amount) * fx.rate

        # ✅ Spending limit & fraud check
        ok, msg = enforce_spending_limit(sender_wallet, total_deduct)
        if not ok:
            return jsonify({"msg": msg}), 403

        is_fraud, reasons = is_transaction_suspicious(sender, data.amount, session)
        if is_fraud:
            session.add(FraudLog(user_id=sender.id, reason="; ".join(reasons)))
            sender.is_active = False
            session.commit()
            return jsonify({"msg": "Transaction flagged", "reasons": reasons}), 403

        # ✅ Perform transfer
        sender_wallet.balance -= total_deduct
        recipient_wallet.balance += converted_amount

        tx_out = Transaction(
            user_id=sender.id,
            amount=data.amount,
            currency=sender_wallet.currency,
            transaction_type="intl_transfer",
            status="success",
            note=f"Sent to {recipient.email} in {recipient_wallet.currency}"
        )
        tx_in = Transaction(
            user_id=recipient.id,
            amount=converted_amount,
            currency=recipient_wallet.currency,
            transaction_type="intl_receive",
            status="success",
            note=f"Received from {sender.email}"
        )
        session.add_all([tx_out, tx_in])
        session.commit()

        # ✅ Notifications
        send_mock_notification(sender.id, f"You sent {data.amount} {sender_wallet.currency} to {recipient.email}")
        send_mock_notification(recipient.id, f"You received {converted_amount} {recipient_wallet.currency} from {sender.email}")

        # ✅ Success response
        return jsonify({
            "msg": "International transfer complete",
            "sent_amount": float(data.amount),
            "converted_amount": converted_amount,
            "fx_rate": fx.rate,
            "fee_charged": fee,
            "recipient_currency": recipient_wallet.currency
        }), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"msg": "Transfer failed", "error": str(e)}), 500
    finally:
        session.close()