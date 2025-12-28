from src.extentions import db
from datetime import datetime, timezone

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    notification_type = db.Column(db.String(20), nullable=False)  # 'follow', 'like', 'comment'
    
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    comment_id = db.Column(db.Integer, db.ForeignKey("comments.id"))
    
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationships
    user = db.relationship("User", foreign_keys=[user_id], backref="notifications")
    actor = db.relationship("User", foreign_keys=[actor_id])
    post = db.relationship("Post", foreign_keys=[post_id])
    comment = db.relationship("Comment", foreign_keys=[comment_id])

    def to_dict(self):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "actor": {
                "id": self.actor.id,
                "username": self.actor.username,
                "profile_image": self.actor.profile_image,
            } if self.actor else None,
            "notification_type": self.notification_type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }
        
        if self.notification_type == "like" and self.post_id:
            data["post"] = {
                "id": self.post_id,
                "title": self.post.title if self.post else None,
            }
        elif self.notification_type == "comment" and self.post_id:
            data["post"] = {
                "id": self.post_id,
                "title": self.post.title if self.post else None,
            }
            if self.comment_id:
                data["comment"] = {
                    "id": self.comment_id,
                    "content": self.comment.content if self.comment else None,
                }
        
        return data
