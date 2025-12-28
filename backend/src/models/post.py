from src.extentions import db
from datetime import datetime, timezone

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(150), nullable=False)
    caption = db.Column(db.Text)
    image_url = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    likes = db.relationship("Like", backref="post", lazy=True, cascade="all, delete")
    comments = db.relationship("Comment", backref="post", lazy=True, cascade="all, delete")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "author_username": self.auther.username if self.auther else None,
            "title": self.title,
            "caption": self.caption,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
            "like_count": len(self.likes),
            "comment_count": len(self.comments),
        }