# app/__init__.py
from flask import Flask
from .routes.auth import auth_bp 
from .config import Config
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    JWTManager(app)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app
