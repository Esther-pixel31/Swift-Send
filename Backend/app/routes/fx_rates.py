from flask import Blueprint, request, jsonify
from ..models.fx_rate import FXRate
from ..db.session import SessionLocal

fx_bp = Blueprint('fx', __name__)

@fx_bp.route('/fx-rate', methods=['GET'])
def get_fx_rate():
    base = request.args.get('base')
    target = request.args.get('target')

    if not base or not target:
        return jsonify({"msg": "Missing base or target parameter"}), 400

    session = SessionLocal()
    try:
        fx = session.query(FXRate).filter_by(
            base_currency=base.upper(),
            target_currency=target.upper()
        ).first()

        if not fx:
            return jsonify({"msg": "FX rate not found"}), 404

        return jsonify({
            "base_currency": fx.base_currency,
            "target_currency": fx.target_currency,
            "rate": fx.rate,
            "fee_percent": fx.fee_percent
        }), 200
    finally:
        session.close()
