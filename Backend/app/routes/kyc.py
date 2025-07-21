from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models.kyc import KYC
from ..db.session import SessionLocal
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

    # Save with a unique filename to avoid collisions
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    user_id = get_jwt_identity()
    session = SessionLocal()

    try:
        kyc_doc = KYC(
            user_id=user_id,
            document_type=document_type,
            document_number=document_number,  # Encrypt if needed
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
