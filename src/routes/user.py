import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from werkzeug.utils import secure_filename
from src.models.user import User
from src.models.post import Post
from src.models.follow import Follow
from src.models.notification import Notification
from src.extentions import db


user_bp = Blueprint('user', __name__, url_prefix='/api')

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Get user profile by username
@user_bp.route('/user/<username>', methods=['GET'])
@jwt_required()
def get_user(username):
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    user_data = user.to_dict()
    user_data['total_posts'] = Post.query.filter_by(user_id=user.id).count()
    current_user_id = get_jwt_identity()
    if current_user_id:
        is_following = Follow.query.filter_by(
            follower_id=current_user_id, following_id=user.id
        ).first()
        user_data['is_following'] = True if is_following else False
    
    return jsonify(user_data), 200

# Get current logged-in user profile
@user_bp.route('/user/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    user_data = user.to_dict()
    user_data['total_posts'] = Post.query.filter_by(user_id=user.id).count()
    user_data['is_following'] = False
    
    return jsonify(user_data), 200


# Update user profile
@user_bp.route('/user/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    data = request.json
    
    if 'bio' in data:
        user.bio = data['bio']
    
    db.session.commit()
    
    return jsonify({"msg": "profile updated successfully", "user": user.to_dict()}), 200


# Update profile picture
@user_bp.route('/user/profile-picture', methods=['PUT'])
@jwt_required()
def update_profile_picture():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "user not found"}), 404
    
    # Check if a file was uploaded
    if 'profile_image' not in request.files:
        return jsonify({"msg": "no file provided"}), 400
    
    file = request.files['profile_image']
    
    if file.filename == '':
        return jsonify({"msg": "no file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"msg": "invalid file type. Allowed types: png, jpg, jpeg, gif"}), 400
    
    # Delete old profile image if it exists
    if user.profile_image:
        old_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.profile_image)
        if os.path.exists(old_image_path):
            try:
                os.remove(old_image_path)
            except Exception as e:
                current_app.logger.error(f"Error deleting old profile image: {e}")
    
    # Save new profile image
    filename = secure_filename(file.filename)
    # Add user ID prefix to make filename unique
    unique_filename = f"profile_{user_id}_{filename}"
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(upload_path)
    
    # Update user profile_image field
    user.profile_image = unique_filename
    db.session.commit()
    
    return jsonify({
        "msg": "profile picture updated successfully", 
        "user": user.to_dict()
    }), 200


# Follow another user
@user_bp.route('/user/<username>/follow', methods=['POST'])
@jwt_required()
def follow_user(username):
    current_user_id = get_jwt_identity()
    target_user = User.query.filter_by(username=username).first()

    if not target_user:
        return jsonify({"msg": "user not found"}), 404

    if target_user.id == int(current_user_id):
        return jsonify({"msg": "cannot follow yourself"}), 400

    existing = Follow.query.filter_by(
        follower_id=current_user_id, following_id=target_user.id
    ).first()

    if existing:
        return jsonify({"msg": "already following"}), 409

    follow = Follow(follower_id=current_user_id, following_id=target_user.id)
    db.session.add(follow)
    db.session.commit()

    # Create follow notification
    notification = Notification(
        user_id=target_user.id,
        actor_id=int(current_user_id),
        notification_type='follow'
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({"msg": "followed successfully"}), 201


# Unfollow a user
@user_bp.route('/user/<username>/unfollow', methods=['POST'])
@jwt_required()
def unfollow_user(username):
    current_user_id = get_jwt_identity()
    target_user = User.query.filter_by(username=username).first()

    if not target_user:
        return jsonify({"msg": "user not found"}), 404

    follow = Follow.query.filter_by(
        follower_id=current_user_id, following_id=target_user.id
    ).first()

    if not follow:
        return jsonify({"msg": "not following"}), 404

    db.session.delete(follow)
    db.session.commit()

    return jsonify({"msg": "unfollowed successfully"}), 200


# List followers of a user
@user_bp.route('/user/<username>/followers', methods=['GET'])
@jwt_required()
def get_followers(username):
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"msg": "user not found"}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    followers_query = Follow.query.filter_by(following_id=user.id).paginate(
        page=page, per_page=per_page
    )

    followers_data = []
    for follow in followers_query.items:
        follower_user = User.query.get(follow.follower_id)
        if follower_user:
            followers_data.append(follower_user.to_dict())

    return jsonify({
        "username": user.username,
        "followers": followers_data,
        "total": followers_query.total,
        "pages": followers_query.pages,
        "current_page": page
    }), 200


# List who the user is following
@user_bp.route('/user/<username>/following', methods=['GET'])
@jwt_required()
def get_following(username):
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"msg": "user not found"}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    following_query = Follow.query.filter_by(follower_id=user.id).paginate(
        page=page, per_page=per_page
    )

    following_data = []
    for follow in following_query.items:
        following_user = User.query.get(follow.following_id)
        if following_user:
            following_data.append(following_user.to_dict())

    return jsonify({
        "username": user.username,
        "following": following_data,
        "total": following_query.total,
        "pages": following_query.pages,
        "current_page": page
    }), 200