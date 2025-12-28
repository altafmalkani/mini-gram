from .auth import auth_bp
from .user import user_bp
from .post import post_bp
from .interaction import interaction_bp
from .admin import admin_bp
from .notification import notification_bp

__all__ = ['auth_bp', 'user_bp', 'post_bp', 'interaction_bp', 'admin_bp', 'notification_bp']