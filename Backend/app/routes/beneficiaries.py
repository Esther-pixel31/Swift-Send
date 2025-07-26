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

@beneficiary_bp.route('/', methods=['POST'])
@jwt_required()
def add_beneficiary():
    user_id = get_jwt_identity()
    data = request.get_json()
    session = SessionLocal()
    try:
        beneficiary = Beneficiary(
            user_id=user_id,
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            bank_account=data.get('bank_account'),
            bank_name=data.get('bank_name'),
            currency=data.get('currency'),
            is_favorite=data.get('is_favorite', False)
        )
        session.add(beneficiary)
        session.commit()
        return jsonify({"msg": "Beneficiary added"}), 201
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"msg": "Failed to add beneficiary", "error": str(e)}), 500
    finally:
        session.close()

@beneficiary_bp.route('/', methods=['GET'])
@jwt_required()
def list_beneficiaries():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        beneficiaries = session.query(Beneficiary).filter_by(user_id=user_id).all()
        return jsonify([b.serialize() for b in beneficiaries]), 200
    finally:
        session.close()

@beneficiary_bp.route('/<int:beneficiary_id>', methods=['PUT'])
@jwt_required()
def update_beneficiary(beneficiary_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    session = SessionLocal()
    try:
        beneficiary = session.query(Beneficiary).filter_by(id=beneficiary_id, user_id=user_id).first()
        if not beneficiary:
            return jsonify({"msg": "Beneficiary not found"}), 404

        for key in ['name', 'email', 'phone', 'bank_account', 'bank_name', 'currency', 'is_favorite']:
            if key in data:
                setattr(beneficiary, key, data[key])

        session.commit()
        return jsonify({"msg": "Beneficiary updated"}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"msg": "Failed to update beneficiary"}), 500
    finally:
        session.close()

@beneficiary_bp.route('/<int:beneficiary_id>', methods=['DELETE'])
@jwt_required()
def delete_beneficiary(beneficiary_id):
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        beneficiary = session.query(Beneficiary).filter_by(id=beneficiary_id, user_id=user_id).first()
        if not beneficiary:
            return jsonify({"msg": "Beneficiary not found"}), 404

        session.delete(beneficiary)
        session.commit()
        return jsonify({"msg": "Beneficiary deleted"}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"msg": "Failed to delete beneficiary"}), 500
    finally:
        session.close()

