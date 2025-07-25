from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
import traceback
from ..models.wallet import Wallet
from ..models.user import User
from ..db.session import SessionLocal
from ..utils.otp import create_otp, verify_otp
from ..schemas import RegisterSchema 
from ..schemas import LoginSchema
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = RegisterSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({"msg": "Invalid input", "errors": e.errors()}), 400

    session = SessionLocal()
    try:
        if session.query(User).filter_by(email=data.email).first():
            return jsonify({"msg": "Email already exists"}), 409

        user = User(name=data.name, email=data.email)
        user.set_password(data.password)

        session.add(user)
        session.flush()

        wallet = Wallet(user_id=user.id, balance=0.0, currency="USD")
        session.add(wallet)
        session.commit()

        return jsonify({"msg": "User and wallet created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        session.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        parsed_data = LoginSchema(**request.get_json())
    except ValidationError as e:
        return jsonify({'msg': 'Invalid input', 'errors': e.errors()}), 400

    email = parsed_data.email
    password = parsed_data.password

    session = SessionLocal()
    try:
        user = session.query(User).filter_by(email=email).first()

        if user and user.check_password(password):
            if not user.is_active:
                return jsonify({"msg": "Your account is suspended"}), 403

            # 🚨 OTP must be verified
            if not user.otp_verified:
                return jsonify({"msg": "OTP verification required"}), 401

            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)

            return jsonify({
                "access_token": access_token,
                "refresh_token": refresh_token
            }), 200

        return jsonify({"msg": "Invalid credentials"}), 401
    finally:
        session.close()

@auth_bp.route('/generate-otp', methods=['POST'])
@jwt_required()
def generate_otp_route():
    user_id = get_jwt_identity()
    code = create_otp(user_id)
    return jsonify({"msg": "OTP generated", "code": code}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
@jwt_required()
def verify_otp_route():
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"msg": "Missing OTP code"}), 400

    session = SessionLocal()
    try:
        if verify_otp(user_id, code):
            user = session.query(User).get(user_id)
            user.otp_verified = True
            session.commit()
            return jsonify({"msg": "OTP verified successfully"}), 200
        else:
            return jsonify({"msg": "Invalid or expired OTP"}), 400
    finally:
        session.close()


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)
    return jsonify({
        "access_token": new_access_token
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if user:
            user.otp_verified = False
            session.commit()
        return jsonify({"msg": "Logged out successfully"}), 200
    finally:
        session.close()

@auth_bp.route('/biometric-auth', methods=['POST'])
@jwt_required()
def biometric_auth():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        if not user or not user.biometric_enabled:
            return jsonify({"msg": "Biometric authentication not enabled for this user"}), 403

        # Simulate biometric verification here
        # In reality, verify signed biometric payload from frontend (e.g., FaceID/Fingerprint)
        biometric_payload = request.json.get("biometric_token")
        if biometric_payload != "stub-token":
            return jsonify({"msg": "Invalid biometric verification"}), 401

        return jsonify({"msg": "Biometric verified successfully"}), 200
    finally:
        session.close()
