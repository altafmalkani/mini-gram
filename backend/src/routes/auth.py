import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token

from src.models.user import User
from src.extentions import db
from src.schemas.auth_schema import RegisterSchema, LoginSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# check file extention
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# register the user
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = RegisterSchema().load(request.form)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422
    
    file = request.files.get("profile_image")

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    bio = data.get("bio")

    if not username or not email or not password:
        return jsonify({"msg": "missing credentials"}), 400

    if User.query.filter(
        (User.username == username) | (User.email == email)
    ).first():
        return jsonify({"msg": "user already exists"}), 409

    user = User(
        username=username,
        email=email,
        role="user",  # Force all registrations to be regular users
        bio=bio,
        created_at=datetime.now(timezone.utc),
    )

    user.set_password(password)

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(upload_path)
        user.profile_image = filename

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "successfully registered"}), 201


# user login
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = LoginSchema().load(request.form)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422

    identifier = data.get('identifier')
    password = data.get('password')

    if not data or not identifier or not password:
        return jsonify({"msg": "missing credentials"}), 400
    
    user = User.query.filter_by(username=identifier).first()

    if not user:
        user = User.query.filter_by(email=identifier).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "invalid credentials"}), 401
    
    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    
    return jsonify({"msg": "login successfull", "token_key": token, "role": user.role}), 200