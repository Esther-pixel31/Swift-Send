# app/__init__.py
from flask import Flask
from .routes.auth import auth_bp 
from .config import Config
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .routes.kyc import kyc_bp
from .routes.wallet_routes import wallet_bp
from .routes.transfer import transfer_bp
from .routes.transaction_history import history_bp
from .routes.mock_payment import mock_payments_bp
from .utils.scheduler import start_scheduler
from .routes.beneficiaries import beneficiary_bp
from app.routes.user import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    JWTManager(app)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(kyc_bp, url_prefix='/api/kyc')
    app.register_blueprint(wallet_bp, url_prefix='/api/wallet')
    app.register_blueprint(transfer_bp, url_prefix='/api/transfer')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(mock_payments_bp, url_prefix='/api/payments')
    app.register_blueprint(beneficiary_bp, url_prefix='/api/beneficiaries')
    app.register_blueprint(user_bp, url_prefix="/api/user")

    start_scheduler()
    
    return app
