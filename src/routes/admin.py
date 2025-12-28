from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from functools import wraps

from src.models.user import User
from src.models.post import Post
from src.models.comment import Comment
from src.models.like import Like
from src.extentions import db

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# Decorator to check if user is admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        jwt_data = get_jwt()
        if jwt_data.get('role') != 'admin':
            return jsonify({"msg": "admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Get admin dashboard statistics
@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def admin_dashboard():
    total_users = User.query.count()
    total_posts = Post.query.count()
    total_comments = Comment.query.count()
    total_likes = Like.query.count()
    
    admin_users = User.query.filter_by(role='admin').count()
    regular_users = total_users - admin_users
    
    return jsonify({
        "total_users": total_users,
        "admin_users": admin_users,
        "regular_users": regular_users,
        "total_posts": total_posts,
        "total_comments": total_comments,
        "total_likes": total_likes
    }), 200


# Get all users with pagination
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role = request.args.get('role', None)
    
    query = User.query
    if role:
        query = query.filter_by(role=role)
    
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "users": [user.to_dict() for user in users.items],
        "total": users.total,
        "pages": users.pages,
        "current_page": page
    }), 200


# Get details of a specific user
@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user_details(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    user_data = user.to_dict()
    user_data['total_posts'] = Post.query.filter_by(user_id=user_id).count()
    user_data['total_comments'] = Comment.query.filter_by(user_id=user_id).count()
    user_data['total_likes'] = Like.query.filter_by(user_id=user_id).count()
    
    return jsonify(user_data), 200


# Get all posts by a user
@admin_bp.route('/users/<int:user_id>/posts', methods=['GET'])
@jwt_required()
@admin_required
def get_user_all_posts(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    
    return jsonify({
        "username": user.username,
        "posts": [post.to_dict() for post in posts]
    }), 200


# Delete a user and all their content
@admin_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    
    if int(current_user_id) == user_id:
        return jsonify({"msg": "cannot delete your own account"}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "user deleted successfully"}), 200


# Get all posts with pagination
@admin_bp.route('/posts', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_all_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "posts": [post.to_dict() for post in posts.items],
        "total": posts.total,
        "pages": posts.pages,
        "current_page": page
    }), 200


# Get details of a specific post
@admin_bp.route('/posts/<int:post_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_post_details(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    return jsonify(post.to_dict()), 200


# Delete a post
@admin_bp.route('/posts/<int:post_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def admin_delete_post(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"msg": "post deleted successfully"}), 200


# Get all comments with pagination
@admin_bp.route('/comments', methods=['GET'])
@jwt_required()
@admin_required
def get_all_comments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    comments = Comment.query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "comments": [comment.to_dict() for comment in comments.items],
        "total": comments.total,
        "pages": comments.pages,
        "current_page": page
    }), 200


# Get details of a specific comment
@admin_bp.route('/comments/<int:comment_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_comment_details(comment_id):
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    return jsonify(comment.to_dict()), 200


# Delete a comment
@admin_bp.route('/comments/<int:comment_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def admin_delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    # Delete all replies to this comment
    Comment.query.filter_by(parent_id=comment_id).delete()
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({"msg": "comment deleted successfully"}), 200


# Get all comments by a user
@admin_bp.route('/users/<int:user_id>/comments', methods=['GET'])
@jwt_required()
@admin_required
def get_user_comments(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    comments = Comment.query.filter_by(user_id=user_id).order_by(Comment.created_at.desc()).all()
    
    return jsonify({
        "username": user.username,
        "comments": [comment.to_dict() for comment in comments]
    }), 200
