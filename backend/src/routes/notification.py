from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.models.notification import Notification
from src.extentions import db

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')


@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications (paginated)"""
    user_id = get_jwt_identity()
    
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Notification.query.filter_by(user_id=user_id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    notifications = query.order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page
    )
    
    return jsonify({
        "notifications": [notif.to_dict() for notif in notifications.items],
        "total": notifications.total,
        "pages": notifications.pages,
        "current_page": page,
        "unread_count": Notification.query.filter_by(user_id=user_id, is_read=False).count()
    }), 200


@notification_bp.route('/<int:notification_id>', methods=['GET'])
@jwt_required()
def get_notification(notification_id):
    """Get a specific notification"""
    user_id = get_jwt_identity()
    
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({"msg": "notification not found"}), 404
    
    if notification.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    return jsonify(notification.to_dict()), 200


@notification_bp.route('/<int:notification_id>/mark-read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    user_id = get_jwt_identity()
    
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({"msg": "notification not found"}), 404
    
    if notification.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({"msg": "notification marked as read"}), 200


@notification_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_read():
    """Mark all user's notifications as read"""
    user_id = get_jwt_identity()
    
    Notification.query.filter_by(user_id=user_id, is_read=False).update({
        Notification.is_read: True
    })
    db.session.commit()
    
    return jsonify({"msg": "all notifications marked as read"}), 200


@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    user_id = get_jwt_identity()
    
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({"msg": "notification not found"}), 404
    
    if notification.user_id != int(user_id):
        return jsonify({"msg": "unauthorized"}), 403
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({"msg": "notification deleted"}), 200


@notification_bp.route('', methods=['DELETE'])
@jwt_required()
def delete_all_notifications():
    """Delete all user's notifications"""
    user_id = get_jwt_identity()
    
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({"msg": "all notifications deleted"}), 200
