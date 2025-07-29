from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    create_refresh_token
)
from ..models.wallet import Wallet
from ..models.user import User
from ..db.session import SessionLocal
from ..utils.otp import create_otp, verify_otp
from ..schemas import RegisterSchema, LoginSchema
from pydantic import ValidationError
from ..utils.card import generate_card_number
from datetime import datetime, timedelta
from ..utils.encryption import encrypt_cvc, decrypt_cvc
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from ..models.support_ticket import SupportTicket
from flask import request
import random

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

        user = User(
            name=data.name,
            email=data.email,
            card_number=generate_card_number()  # 🔐 Assign card number here
        )
        user.set_password(data.password)

        session.add(user)
        session.flush()  # Get user.id

        user.card_cvc = encrypt_cvc(''.join(str(random.randint(0, 9)) for _ in range(3)))
        user.card_expiry = (datetime.utcnow() + timedelta(days=365 * 4)).strftime('%m/%y')
        user.card_cvc = ''.join(str(random.randint(0, 9)) for _ in range(3))

        wallet = Wallet(user_id=user.id, balance=0.0, currency="KES")
        session.add(wallet)
        session.commit()

        return jsonify({"msg": "User and wallet created successfully"}), 201

    except Exception as e:
        print("🚨 Register Error:", e)
        session.rollback()
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

            if not user.otp_verified:
                return jsonify({
                    "msg": "OTP verification required",
                    "requires_otp": True,
                    "email": user.email
                }), 200

            claims = {
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "otp_verified": True,
                "card_number": user.card_number,
                "card_expiry": user.card_expiry,
                "card_cvc": user.card_cvc
            }
            access_token = create_access_token(identity=user.id, additional_claims=claims)
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

            # ✅ Return new tokens after verification with updated claim
            claims = {
                "email": user.email,
                "name": user.name,               # ✅ this line ensures name is in token
                "otp_verified": user.otp_verified,
                "card_number": user.card_number,
                "card_expiry": user.card_expiry,
                "card_cvc": user.card_cvc,
            }
            access_token = create_access_token(identity=user.id, additional_claims=claims)
            refresh_token = create_refresh_token(identity=user.id)

            return jsonify({
                "msg": "OTP verified successfully",
                "access_token": access_token,
                "refresh_token": refresh_token
            }), 200
        else:
            return jsonify({"msg": "Invalid or expired OTP"}), 400
    finally:
        session.close()


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()

    session = SessionLocal()
    try:
        user = session.query(User).get(user_id)
        claims = {
                "email": user.email,
                "name": user.name,               # ✅ this line ensures name is in token
                "otp_verified": user.otp_verified,
                "card_number": user.card_number
            }
        new_access_token = create_access_token(identity=user.id, additional_claims=claims)

        return jsonify({
            "access_token": new_access_token
        }), 200
    finally:
        session.close()


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

        biometric_payload = request.json.get("biometric_token")
        if biometric_payload != "stub-token":
            return jsonify({"msg": "Invalid biometric verification"}), 401

        return jsonify({"msg": "Biometric verified successfully"}), 200
    finally:
        session.close()

@auth_bp.route("/support", methods=["POST"])
@jwt_required()
def create_ticket():
    user_id = get_jwt_identity()
    data = request.get_json()
    subject = data.get("subject")
    message = data.get("message")

    if not subject or not message:
        return jsonify({"msg": "Subject and message are required"}), 400

    session = SessionLocal()
    ticket = SupportTicket(user_id=user_id, subject=subject, message=message)
    session.add(ticket)
    session.commit()

    # 🟢 Notify the user
    from app.utils.mock_notify import send_mock_notification
    send_mock_notification(user_id, f"Your support ticket '{subject}' has been submitted.")

    session.close()
    return jsonify({"msg": "Ticket submitted"}), 201


@auth_bp.route("/support", methods=["GET"])
@jwt_required()
def list_user_tickets():
    user_id = get_jwt_identity()
    session = SessionLocal()
    tickets = session.query(SupportTicket).filter_by(user_id=user_id).order_by(SupportTicket.created_at.desc()).all()
    session.close()
    return jsonify([t.serialize() for t in tickets]), 200


@auth_bp.route('/google', methods=['POST'])
def google_login():
    token = request.json.get('credential')

    if not token:
        return jsonify({'msg': 'Missing token'}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            '524179187669-fv1m428gts5bto6v01i20vo5oj855qlb.apps.googleusercontent.com'
        )

        email = idinfo.get('email')
        name = idinfo.get('name')

        if not email:
            return jsonify({'msg': 'Google token missing email'}), 400

        session = SessionLocal()
        try:
            user = session.query(User).filter_by(email=email).first()

            if not user:
                # 🔐 Create user and assign card info
                user = User(
                    email=email,
                    name=name,
                    role='user',
                    otp_verified=True,
                    is_active=True,
                    card_number=generate_card_number(),
                    card_expiry=(datetime.utcnow() + timedelta(days=365 * 4)).strftime('%m/%y'),
                    card_cvc=encrypt_cvc(''.join(str(random.randint(0, 9)) for _ in range(3))),
                )
                session.add(user)
                session.flush()  # Assigns user.id without full commit

                # 💰 Create wallet for new Google user
                wallet = Wallet(user_id=user.id, balance=0.0, currency="KES")
                session.add(wallet)
                session.commit()
            else:
                # ✅ Ensure wallet exists for existing user
                wallet = session.query(Wallet).filter_by(user_id=user.id).first()
                if not wallet:
                    wallet = Wallet(user_id=user.id, balance=0.0, currency="KES")
                    session.add(wallet)
                    session.commit()

            if not user.is_active:
                return jsonify({"msg": "Your account is suspended"}), 403

            claims = {
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "otp_verified": user.otp_verified,
                "card_number": user.card_number,
                "card_expiry": user.card_expiry,
                "card_cvc": decrypt_cvc(user.card_cvc)
            }

            access_token = create_access_token(identity=user.id, additional_claims=claims)
            refresh_token = create_refresh_token(identity=user.id)

            return jsonify({
                "access_token": access_token,
                "refresh_token": refresh_token
            }), 200

        finally:
            session.close()

    except ValueError as e:
        print(f"Google login error: {e}")
        return jsonify({'msg': 'Invalid Google token'}), 400
