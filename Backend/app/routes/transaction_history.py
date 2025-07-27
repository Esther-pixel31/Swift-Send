from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.transaction import Transaction
from ..db.session import SessionLocal
from flask import send_file
import pandas as pd
from io import BytesIO
from reportlab.platypus import SimpleDocTemplate, Table
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from flask import request

history_bp = Blueprint('history', __name__)

@history_bp.route('/my-transactions', methods=['GET'])
@jwt_required()
def my_transactions():
    user_id = get_jwt_identity()
    session = SessionLocal()
    try:
        txns = session.query(Transaction)\
            .filter_by(user_id=user_id)\
            .order_by(Transaction.created_at.desc())\
            .all()
        return jsonify([txn.serialize() for txn in txns]), 200
    finally:
        session.close()

@history_bp.route('/my-transactions/download', methods=['GET'])
@jwt_required()
def download_transactions():
    user_id = get_jwt_identity()
    format = request.args.get("format", "csv").lower()

    session = SessionLocal()
    try:
        txns = session.query(Transaction).filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
        data = [txn.serialize() for txn in txns]
        df = pd.DataFrame(data)

        if df.empty:
            return jsonify({"msg": "No transactions to export"}), 404

        if format == "csv":
            output = BytesIO()
            df.to_csv(output, index=False)
            output.seek(0)
            return send_file(
                output,
                mimetype="text/csv",
                as_attachment=True,
                download_name="transactions.csv"
            )

        elif format == "pdf":
            output = BytesIO()
            doc = SimpleDocTemplate(output, pagesize=letter)
            table_data = [df.columns.tolist()] + df.values.tolist()
            table = Table(table_data)
            table.setStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.gray),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ])
            doc.build([table])
            output.seek(0)
            return send_file(
                output,
                mimetype="application/pdf",
                as_attachment=True,
                download_name="transactions.pdf"
            )

        else:
            return jsonify({"msg": "Unsupported format. Use ?format=csv or ?format=pdf"}), 400
    finally:
        session.close()