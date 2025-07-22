from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.transaction import Transaction
from ..db.session import SessionLocal

history_bp = Blueprint('history', __name__)

@history_bp.route('/my-transactions', methods=['GET'])
@jwt_required()
def my_transactions():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        txns = session.query(Transaction).filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
        return jsonify([txn.serialize() for txn in txns]), 200
    finally:
        session.close()
