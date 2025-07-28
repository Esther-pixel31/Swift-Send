from flask import Blueprint, request, jsonify, send_from_directory, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models.kyc import KYC
from ..db.session import SessionLocal
from ..utils.encryption import encrypt_data, decrypt_data
import os
import uuid

kyc_bp = Blueprint('kyc', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@kyc_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    if 'document' not in request.files:
        return jsonify({'msg': 'No document part'}), 400

    file = request.files['document']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'msg': 'Invalid file type. Allowed types are: pdf, jpg, jpeg, png'}), 400

    document_type = request.form.get('document_type')
    document_number = request.form.get('document_number')

    if not document_type or not document_number:
        return jsonify({'msg': 'document_type and document_number are required'}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        encrypted_number = encrypt_data(document_number)

        kyc_doc = KYC(
            user_id=user_id,
            document_type=document_type,
            document_number=encrypted_number,
            file_path=filepath
        )
        session.add(kyc_doc)
        session.commit()
    except Exception as e:
        session.rollback()
        return jsonify({'msg': 'Failed to save KYC document', 'error': str(e)}), 500
    finally:
        session.close()

    return jsonify({'msg': 'Document uploaded and saved successfully'}), 201

@kyc_bp.route('/status', methods=['GET'])
@jwt_required()
def get_kyc_status():
    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        kyc_doc = session.query(KYC).filter_by(user_id=user_id).order_by(KYC.id.desc()).first()

        if not kyc_doc:
            return jsonify({"status": "not_submitted"}), 200

        file_url = url_for('kyc.serve_kyc_file', filename=os.path.basename(kyc_doc.file_path), _external=True)

        response = {
            "status": kyc_doc.status,
            "document_type": kyc_doc.document_type,
            "document_number": decrypt_data(kyc_doc.document_number),
            "reviewed_at": kyc_doc.reviewed_at,
            "reviewed_by": kyc_doc.reviewed_by,
            "file_url": file_url
        }

        if kyc_doc.status == "rejected":
            response["rejection_reason"] = kyc_doc.rejection_reason

        return jsonify(response), 200
    finally:
        session.close()

@kyc_bp.route('/uploads/<filename>')
def serve_kyc_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
