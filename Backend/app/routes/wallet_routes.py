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
from ..models.transaction import Transaction
from ..utils.mpesa import generate_mpesa_code


wallet_bp = Blueprint('wallet', __name__)

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

@wallet_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = Decimal(str(data.get("amount")))

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        wallet.balance += amount

        txn = Transaction(
            user_id=user_id,
            transaction_type="deposit",
            amount=amount,
            note="Wallet deposit",
            currency=wallet.currency,
            status="completed",
            created_at=datetime.utcnow()
        )


        session.add(txn)
        session.commit()
        return jsonify({"msg": "Deposit successful"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Failed to deposit", "error": str(e)}), 500
    finally:
        session.close()



@wallet_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = Decimal(str(data.get("amount")))

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404
        if wallet.balance < amount:
            return jsonify({"msg": "Insufficient balance"}), 400

        wallet.balance -= amount

        txn = Transaction(
        user_id=user_id,
        transaction_type="withdraw",
        amount=amount,
        note="Wallet withdrawal",
        currency=wallet.currency,
        status="completed",
        created_at=datetime.utcnow()
    )


        session.add(txn)
        session.commit()
        return jsonify({"msg": "Withdrawal successful"}), 200
    except Exception as e:
        session.rollback()
        print("Withdraw error:", str(e))  
        return jsonify({"msg": "Failed to withdraw", "error": str(e)}), 500

    finally:
        session.close()



@wallet_bp.route('/update-limits', methods=['POST'])
@jwt_required()
def update_wallet_limits():
    user_id = get_jwt_identity()
    data = request.get_json()

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        daily_limit = data.get("daily_limit")
        monthly_limit = data.get("monthly_limit")
        budget = data.get("budget")

        description_parts = []

        if daily_limit is not None:
            wallet.daily_limit = Decimal(str(daily_limit))
            description_parts.append(f"Daily: {daily_limit}")
        if monthly_limit is not None:
            wallet.monthly_limit = Decimal(str(monthly_limit))
            description_parts.append(f"Monthly: {monthly_limit}")
        if budget is not None:
            wallet.budget = Decimal(str(budget))
            description_parts.append(f"Budget: {budget}")

        wallet.last_spending_reset = datetime.utcnow()

        
        txn = Transaction(
    user_id=user_id,
    transaction_type="limit-update",
    amount=Decimal('0'),
    note='Updated limits - ' + ', '.join(description_parts),
    currency=wallet.currency,
    status="completed",
    created_at=datetime.utcnow()
)

        session.add(txn)

        session.commit()
        return jsonify({"msg": "Limits set/updated successfully"}), 200
    except Exception:
        session.rollback()
        return jsonify({"msg": "Failed to set limits"}), 500
    finally:
        session.close()

@wallet_bp.route('/mock-deposit', methods=['POST'])
@jwt_required()
def mock_deposit():
    user_id = get_jwt_identity()
    data = request.get_json()

    amount = Decimal(str(data.get("amount", 0)))
    method = data.get("method")  

    if amount <= 0 or method not in ["mpesa", "card"]:
        return jsonify({"msg": "Invalid deposit request"}), 400

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"msg": "Wallet not found"}), 404

        if method == "mpesa":
            reference = generate_mpesa_code()
            note = "Mock M-Pesa Deposit"
        else:
            reference = f"CARD-{uuid.uuid4().hex[:8]}"
            note = "Mock Card Deposit"

        wallet.balance += amount

        txn = Transaction(
            user_id=user_id,
            transaction_type="deposit",
            amount=amount,
            note=note,
            currency=wallet.currency,
            status="completed",
            reference=reference,
            created_at=datetime.utcnow()
        )

        session.add(txn)
        session.commit()

        return jsonify({
            "msg": "Deposit successful",
            "method": method,
            "reference": reference,
            "new_balance": str(wallet.balance)
        }), 200

    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Deposit failed", "error": str(e)}), 500
    finally:
        session.close()


@wallet_bp.route('/mock-withdraw', methods=['POST'])
@jwt_required()
def mock_withdraw():
    user_id = get_jwt_identity()
    data = request.get_json()

    amount = Decimal(str(data.get("amount", 0)))
    method = data.get("method")  
    destination = data.get("destination")  

    if amount <= 0 or not destination or method not in ["mpesa", "card"]:
        return jsonify({"msg": "Invalid withdrawal request"}), 400

    session = SessionLocal()
    try:
        wallet = session.query(Wallet).filter_by(user_id=user_id).first()
        if not wallet or wallet.balance < amount:
            return jsonify({"msg": "Insufficient funds"}), 400

        reference = generate_mpesa_code()  
        wallet.balance -= amount

        txn = Transaction(
            user_id=user_id,
            transaction_type="withdrawal",
            amount=amount,
            note=f"Mock {method.capitalize()} Withdrawal to {destination}",
            currency=wallet.currency,
            status="completed",
            reference=reference,
            created_at=datetime.utcnow()
        )

        session.add(txn)
        session.commit()

        return jsonify({
            "msg": "Withdrawal successful",
            "reference": reference,
            "new_balance": str(wallet.balance)
        }), 200

    except Exception as e:
        session.rollback()
        return jsonify({"msg": "Withdrawal failed", "error": str(e)}), 500
    finally:
        session.close()
