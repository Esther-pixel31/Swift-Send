from flask import Blueprint, request, jsonify, send_from_directory, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models.kyc import KYC
from ..db.session import SessionLocal
from ..utils.encryption import encrypt_data, decrypt_data
from ..utils.mpesa import convert_google_drive_link
from ..utils.mpesa import allowed_file_extension
import requests
import mimetypes
from urllib.parse import urlparse, unquote
import os
import uuid

kyc_bp = Blueprint('kyc', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
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

@kyc_bp.route('/upload-from-url', methods=['POST'])
@jwt_required()
def upload_document_from_url():
    data = request.get_json()
    document_url = data.get('document_url')
    document_type = data.get('document_type')
    document_number = data.get('document_number')

    if not document_url or not document_type or not document_number:
        return jsonify({'msg': 'document_url, document_type, and document_number are required'}), 400
  
    document_url = convert_google_drive_link(document_url)

    try:
        response = requests.get(document_url, timeout=10)
        response.raise_for_status()

        parsed_url = urlparse(document_url)
        path = unquote(parsed_url.path)
        ext = os.path.splitext(path)[-1].lstrip('.').lower()
       
        if not ext or ext not in ALLOWED_EXTENSIONS:
            content_type = response.headers.get('Content-Type', '').lower()
            ext = mimetypes.guess_extension(content_type) or ''
            ext = ext.lstrip('.')
            if ext not in ALLOWED_EXTENSIONS:
                return jsonify({'msg': f'Unsupported file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
       
        base_name = os.path.basename(path) or f"document.{ext}"
        filename = secure_filename(base_name)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

       
        with open(filepath, 'wb') as f:
            f.write(response.content)
      
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
        return jsonify({'msg': 'Document fetched from URL and saved successfully'}), 201
    except requests.exceptions.RequestException as e:
        return jsonify({'msg': 'Failed to download file from URL', 'error': str(e)}), 400
