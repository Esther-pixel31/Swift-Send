import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config, TestConfig

# Import your blueprints
from .routes.auth import auth_bp 
from .routes.kyc import kyc_bp
from .routes.wallet_routes import wallet_bp
from .routes.transfer import transfer_bp
from .routes.transaction_history import history_bp
from .routes.mock_payment import mock_payments_bp
from .routes.beneficiaries import beneficiary_bp
from .routes.user import user_bp
from .routes.admin import admin_bp

from .utils.scheduler import start_scheduler

def create_app(testing=False):  # Accept a testing parameter
    app = Flask(__name__)
    
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    # Load appropriate config
    if testing:
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

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
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    if not testing:
        start_scheduler()

    return app
