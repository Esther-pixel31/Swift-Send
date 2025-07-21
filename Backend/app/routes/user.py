from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..db.session import SessionLocal
from ..models.user import User

user_bp = Blueprint('user', __name__)

# 1. Get current user profile
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404
        return jsonify(user.serialize()), 200
    finally:
        session.close()

# 2. Update user info
@user_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_user_info():
    user_id = get_jwt_identity()
    data = request.get_json()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        user.name = data.get("name", user.name)
        user.phone_number = data.get("phone_number", user.phone_number)
        session.commit()
        return jsonify({"msg": "User info updated"}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"msg": "Update failed"}), 500
    finally:
        session.close()

# 3. Change password
@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user or not user.check_password(current_password):
            return jsonify({"msg": "Incorrect current password"}), 401

        user.set_password(new_password)
        session.commit()
        return jsonify({"msg": "Password changed successfully"}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"msg": "Password change failed"}), 500
    finally:
        session.close()

# 4. Delete user account
@user_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404
        session.delete(user)
        session.commit()
        return jsonify({"msg": "Account deleted"}), 200
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"msg": "Account deletion failed"}), 500
    finally:
        session.close()
