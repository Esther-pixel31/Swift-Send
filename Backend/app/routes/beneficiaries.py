from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.beneficiary import Beneficiary
from ..db.session import SessionLocal

beneficiary_bp = Blueprint('beneficiaries', __name__)

@beneficiary_bp.route('/<int:beneficiary_id>/favorite', methods=['PATCH'])
@jwt_required()
def toggle_favorite_beneficiary(beneficiary_id):
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        beneficiary = session.query(Beneficiary).filter_by(id=beneficiary_id, user_id=user_id).first()
        if not beneficiary:
            return jsonify({"msg": "Beneficiary not found"}), 404

        beneficiary.is_favorite = not beneficiary.is_favorite
        session.commit()

        return jsonify({
            "msg": f"Beneficiary marked as {'favorite' if beneficiary.is_favorite else 'not favorite'}",
            "is_favorite": beneficiary.is_favorite
        }), 200
    finally:
        session.close()
