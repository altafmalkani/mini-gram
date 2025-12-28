from src.extentions import db, bcrypt
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    posts = db.relationship("Post", backref="auther", lazy=True, cascade="all, delete")
    likes = db.relationship("Like", backref="user", lazy=True, cascade="all, delete")
    comments = db.relationship("Comment", backref="user", lazy=True, cascade="all, delete")
    followers = db.relationship(
        "Follow",
        foreign_keys="Follow.following_id",
        backref="following",
        lazy="dynamic",
        cascade="all, delete",
    )
    following = db.relationship(
        "Follow",
        foreign_keys="Follow.follower_id",
        backref="follower",
        lazy="dynamic",
        cascade="all, delete",
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password)
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "profile_image": self.profile_image,
            "created_at": self.created_at.isoformat(),
            "followers_count": self.followers.count() if self.followers else 0,
            "following_count": self.following.count() if self.following else 0,
        }