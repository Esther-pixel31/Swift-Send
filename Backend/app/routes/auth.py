# routes/auth.py
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import traceback

from ..models.user import User
from ..db.session import SessionLocal

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"msg": "Missing name, email, or password"}), 400

    session = SessionLocal()
    try:
        # Check if email already exists
        if session.query(User).filter_by(email=email).first():
            return jsonify({"msg": "Email already exists"}), 409

        user = User(name=name, email=email)
        user.set_password(password)

        session.add(user)
        session.commit()
        return jsonify({"msg": "User registered successfully"}), 201

    except Exception as e:
        print("❌ REGISTER ERROR:", e)
        traceback.print_exc()
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        session.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"msg": "Email and password are required"}), 400

    session = SessionLocal()
    try:
        user = session.query(User).filter_by(email=email).first()

        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id)
            return jsonify({"access_token": access_token}), 200

        return jsonify({"msg": "Invalid credentials"}), 401
    finally:
        session.close()

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email
        })
    finally:
        session.close()
