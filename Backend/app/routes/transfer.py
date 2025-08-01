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
from decimal import Decimal, ROUND_DOWN
from ..models.user import User
from ..models.scheduled_transfer import ScheduledTransfer
import datetime
from ..models.paymentrequest import PaymentRequest
from dateutil import parser

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

        
        ok, msg = enforce_spending_limit(sender_wallet, data.amount)
        warnings = []
        if not ok:
            return jsonify({"msg": msg}), 403
        elif msg:
            warnings.append(msg)    
        
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
        scheduled_at = parser.isoparse(data['scheduled_at'])

        st = ScheduledTransfer(
            user_id=user_id,
            beneficiary_id=data['beneficiary_id'],
            amount=data['amount'],
            currency=data['currency'],
            scheduled_at=scheduled_at,
            recurrence=data.get('recurrence'),
            is_active=True,
            status="scheduled"
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
            .filter(
                ScheduledTransfer.user_id == user_id,
                ScheduledTransfer.is_active == True,
                

            )\
            .order_by(ScheduledTransfer.scheduled_at.asc())\
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


@transfer_bp.route('/international', methods=['POST'])
@jwt_required()
@verified_user_required
def international_transfer():
    session = SessionLocal()
    try:
        
        user_id = get_jwt_identity()
        sender = session.query(User).filter_by(id=user_id).first()
        if not sender:
            return jsonify({"msg": "User not found"}), 404

        
        try:
            check_user_active(sender)
        except InactiveUserError as e:
            return jsonify({"msg": str(e)}), 403

        
        try:
            data = TransferSchema(**request.get_json())
        except ValidationError as e:
            return jsonify({"msg": "Invalid input", "errors": e.errors()}), 400

       
        recipient = session.query(User).filter_by(email=data.receiver_email).first()
        if not recipient:
            return jsonify({"msg": "Recipient not found"}), 404
        if recipient.id == sender.id:
            return jsonify({"msg": "Cannot transfer to yourself"}), 400

      
        sender_wallet = session.query(Wallet).filter_by(user_id=sender.id).first()
        recipient_wallet = session.query(Wallet).filter_by(user_id=recipient.id).first()
        if not sender_wallet or not recipient_wallet:
            return jsonify({"msg": "Wallet not found"}), 404
        if sender_wallet.currency != "KES" or recipient_wallet.currency != "KES":
            return jsonify({"msg": "Both wallets must be in KES for this operation"}), 400

        fx = session.query(FXRate).filter_by(base_currency="KES", target_currency="USD").first()
        if not fx or fx.rate == 0:
            return jsonify({"msg": "Exchange rate not found or invalid"}), 400

        
        usd_amount = Decimal(str(data.amount)).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        rate = Decimal(str(fx.rate)).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        kes_equiv = (usd_amount * rate).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        fee = (kes_equiv * Decimal(fx.fee_percent) / 100).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        total_deduct = (kes_equiv + fee).quantize(Decimal('0.01'), rounding=ROUND_DOWN)

        if sender_wallet.balance < total_deduct:
            return jsonify({"msg": "Insufficient balance"}), 400

       
        ok, msg = enforce_spending_limit(sender_wallet, total_deduct)
        if not ok:
            return jsonify({"msg": msg}), 403

        is_fraud, reasons = is_transaction_suspicious(sender, float(data.amount), session)
        if is_fraud:
            session.add(FraudLog(user_id=sender.id, reason="; ".join(reasons)))
            sender.is_active = False
            session.commit()
            return jsonify({"msg": "Transaction flagged", "reasons": reasons}), 403

        
        sender_wallet.balance -= total_deduct
        recipient_wallet.balance += kes_equiv

        tx_out = Transaction(
            user_id=sender.id,
            amount=kes_equiv,
            currency="KES",
            transaction_type="intl_transfer",
            status="success",
            note=f"Sent USD {usd_amount} (KES {kes_equiv}) to {recipient.email}"
        )
        tx_in = Transaction(
            user_id=recipient.id,
            amount=kes_equiv,
            currency="KES",
            transaction_type="intl_receive",
            status="success",
            note=f"Received USD {usd_amount} (KES {kes_equiv}) from {sender.email}"
        )

        session.add_all([tx_out, tx_in])
        session.commit()

        
        send_mock_notification(sender.id, f"You sent USD {usd_amount} (KES {kes_equiv}) to {recipient.email}")
        send_mock_notification(recipient.id, f"You received KES {kes_equiv} (USD {usd_amount}) from {sender.email}")

        return jsonify({
            "msg": "International transfer complete",
            "sent_amount_usd": float(usd_amount),
            "converted_amount_kes": float(kes_equiv),
            "fee_charged": float(fee),
            "total_deducted_kes": float(total_deduct),
            "fx_rate": float(rate),
            "recipient_currency": recipient_wallet.currency
        }), 200

   
        try:
            data = TransferSchema(**request.get_json())
        except ValidationError as e:
            print("🚫 Validation error in /international route:", e.errors()) 
            return jsonify({"msg": "Invalid input", "errors": e.errors()}), 400

    finally:
        session.close()

@transfer_bp.route("/request-money", methods=["POST"])
@jwt_required()
@verified_user_required
def request_money():
    session = SessionLocal()
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        recipient = session.query(User).filter_by(email=data.get("email")).first()

        if not recipient or recipient.id == user_id:
            return jsonify({"msg": "Invalid recipient"}), 400

        new_request = PaymentRequest(
            requester_id=user_id,
            requestee_id=recipient.id,
            amount=Decimal(str(data.get("amount"))),
            currency=data.get("currency", "KES"),
            note=data.get("note", "")
        )
        session.add(new_request)
        session.commit()

        return jsonify({"msg": "Payment request sent"}), 200
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"msg": "Error", "error": str(e)}), 500
    finally:
        session.close()

@transfer_bp.route('/received-requests', methods=['GET'])
@jwt_required()
@verified_user_required
def get_received_requests():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        requests = (
            session.query(PaymentRequest)
            .filter_by(requestee_id=user_id, status='pending')
            .order_by(PaymentRequest.created_at.desc())
            .all()
        )

        result = []
        for r in requests:
            data = r.serialize()  
            requester = session.query(User).get(r.requester_id)
            if requester:
                data["requester_name"] = requester.name
                data["requester_email"] = requester.email
            result.append(data)

        return jsonify(result), 200
    finally:
        session.close()


@transfer_bp.route('/fulfill-request/<int:request_id>', methods=['POST'])
@jwt_required()
@verified_user_required
def fulfill_payment_request(request_id):
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        payment_request = session.query(PaymentRequest).get(request_id)

        if not payment_request or payment_request.requestee_id != user_id:
            return jsonify({"msg": "Not allowed"}), 403

        if payment_request.status != "pending":
            return jsonify({"msg": "Request already handled"}), 400


        payment_request.status = "accepted"
        session.commit()
        return jsonify({"msg": "Request fulfilled"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Failed to fulfill request", "error": str(e)}), 500
    finally:
        session.close()

@transfer_bp.route('/decline-request/<int:request_id>', methods=['POST'])
@jwt_required()
@verified_user_required
def decline_payment_request(request_id):
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        payment_request = session.query(PaymentRequest).get(request_id)

        if not payment_request or payment_request.requestee_id != user_id:
            return jsonify({"msg": "Not allowed"}), 403

        if payment_request.status != "pending":
            return jsonify({"msg": "Already handled"}), 400

        payment_request.status = "declined"
        session.commit()
        return jsonify({"msg": "Request declined"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Failed to decline request", "error": str(e)}), 500
    finally:
        session.close()
