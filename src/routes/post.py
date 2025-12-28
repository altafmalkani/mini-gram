import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.utils import secure_filename
from marshmallow import ValidationError

from src.models.post import Post
from src.models.user import User
from src.models.notification import Notification
from src.extentions import db
from src.schemas.post_schema import PostCreateSchema, PostUpdateSchema

post_bp = Blueprint('post', __name__, url_prefix='/api/posts')

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Get all posts with pagination
@post_bp.route('', methods=['GET'])
@jwt_required()
def get_all_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "posts": [post.to_dict() for post in posts.items],
        "total": posts.total,
        "pages": posts.pages,
        "current_page": page
    }), 200


# Get a specific post by ID
@post_bp.route('/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    return jsonify(post.to_dict()), 200


# Create a new post
@post_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    try:
        data = PostCreateSchema().load(request.form)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422
    
    user_id = get_jwt_identity()
    
    title = data.get('title')
    caption = data.get('caption')
    
    file = request.files.get('image_url')
    image_url = None
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)
        image_url = filename
    
    post = Post(
        user_id=user_id,
        title=title,
        caption=caption,
        image_url=image_url
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({"msg": "post created successfully", "post": post.to_dict()}), 201


# Update a post
@post_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    try:
        data = PostUpdateSchema().load(request.form)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422
    
    user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    if post.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    if 'title' in data:
        post.title = data['title']
    if 'caption' in data:
        post.caption = data['caption']
    
    db.session.commit()
    
    return jsonify({"msg": "post updated successfully", "post": post.to_dict()}), 200


# Delete a post
@post_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    if post.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    # Delete associated notifications
    Notification.query.filter_by(post_id=post_id).delete()
    db.session.commit()
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"msg": "post deleted successfully"}), 200


# Get all posts by a specific user
@post_bp.route('/<int:post_id>/feed', methods=['GET'])
@jwt_required()
def get_user_posts(post_id):
    user = User.query.get(post_id)
    
    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    posts = Post.query.filter_by(user_id=post_id).order_by(Post.created_at.desc()).all()
    
    return jsonify({
        "username": user.username,
        "posts": [post.to_dict() for post in posts]
    }), 200
