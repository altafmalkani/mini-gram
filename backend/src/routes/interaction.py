from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from src.models.like import Like
from src.models.comment import Comment
from src.models.post import Post
from src.models.notification import Notification
from src.extentions import db
from src.schemas.comment_schema import CommentCreateSchema, CommentUpdateSchema

interaction_bp = Blueprint('interaction', __name__, url_prefix='/api')


# Like a post
@interaction_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    user_id = get_jwt_identity()
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
    if existing_like:
        return jsonify({"msg": "post already liked"}), 409
    
    like = Like(user_id=user_id, post_id=post_id)
    db.session.add(like)
    db.session.commit()
    
    # Create like notification
    notification = Notification(
        user_id=post.user_id,
        actor_id=int(user_id),
        notification_type='like',
        post_id=post_id
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({"msg": "post liked successfully"}), 201


# Unlike a post
@interaction_bp.route('/posts/<int:post_id>/unlike', methods=['POST'])
@jwt_required()
def unlike_post(post_id):
    user_id = get_jwt_identity()
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
    if not like:
        return jsonify({"msg": "post not liked"}), 404
    
    db.session.delete(like)
    db.session.commit()
    
    # Delete associated notification
    Notification.query.filter_by(
        user_id=post.user_id,
        actor_id=int(user_id),
        notification_type='like',
        post_id=post_id
    ).delete()
    db.session.commit()
    
    return jsonify({"msg": "post unliked successfully"}), 200


# Get all users who liked a post
@interaction_bp.route('/posts/<int:post_id>/likes', methods=['GET'])
@jwt_required()
def get_post_likes(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    likes = Like.query.filter_by(post_id=post_id).all()
    
    return jsonify({
        "post_id": post_id,
        "like_count": len(likes),
        "likes": [like.to_dict() for like in likes]
    }), 200


# Create a comment on a post
@interaction_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        data = CommentCreateSchema().load(request.json)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422
    
    user_id = get_jwt_identity()
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    content = data.get('content')
    parent_id = data.get('parent_id')
    
    # Validate parent comment if provided
    if parent_id:
        parent = Comment.query.get(parent_id)
        if not parent or parent.post_id != post_id:
            return jsonify({"msg": "invalid parent comment"}), 404
    
    comment = Comment(
        user_id=user_id,
        post_id=post_id,
        parent_id=parent_id,
        content=content
    )
    
    db.session.add(comment)
    db.session.commit()
    
    # Create comment notification
    notification = Notification(
        user_id=post.user_id,
        actor_id=int(user_id),
        notification_type='comment',
        post_id=post_id,
        comment_id=comment.id
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({"msg": "comment created successfully", "comment": comment.to_dict()}), 201


# Get a specific comment
@interaction_bp.route('/comments/<int:comment_id>', methods=['GET'])
@jwt_required()
def get_comment(comment_id):
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    return jsonify(comment.to_dict()), 200


# Get all comments on a post
@interaction_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required()
def get_post_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "post not found"}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    comments = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(
        Comment.created_at.desc()
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "post_id": post_id,
        "comments": [comment.to_dict() for comment in comments.items],
        "total": comments.total,
        "pages": comments.pages,
        "current_page": page
    }), 200


# Get all replies to a comment
@interaction_bp.route('/comments/<int:comment_id>/replies', methods=['GET'])
@jwt_required()
def get_comment_replies(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    replies = Comment.query.filter_by(parent_id=comment_id).order_by(
        Comment.created_at.asc()
    ).all()
    
    return jsonify({
        "parent_comment_id": comment_id,
        "replies": [reply.to_dict() for reply in replies]
    }), 200


# Update a comment
@interaction_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    try:
        data = CommentUpdateSchema().load(request.json)
    except ValidationError as e:
        return jsonify({"msg": e.messages}), 422
    
    user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    if comment.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    comment.content = data.get('content')
    db.session.commit()
    
    return jsonify({"msg": "comment updated successfully", "comment": comment.to_dict()}), 200


# Delete a comment
@interaction_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({"msg": "comment not found"}), 404
    
    if comment.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    # Delete all replies to this comment
    Comment.query.filter_by(parent_id=comment_id).delete()
    
    db.session.delete(comment)
    db.session.commit()
    
    # Delete associated notifications
    Notification.query.filter_by(comment_id=comment_id).delete()
    db.session.commit()
    
    return jsonify({"msg": "comment deleted successfully"}), 200
