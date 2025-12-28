from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os

from src.extentions import db, jwt
from src.routes import auth_bp, user_bp, post_bp, interaction_bp, admin_bp, notification_bp

from src.models import User, Post, Like, Comment, Follow, Notification

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY'] ='securekey'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dabase.db'
    app.config['UPLOAD_FOLDER'] = 'src/static/images'
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(post_bp)
    app.register_blueprint(interaction_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notification_bp)


    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    with app.app_context():
        db.create_all()

    return app