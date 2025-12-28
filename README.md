# Mini-Gram Backend

A Flask-based social media backend API with role-based authentication, posts, likes, comments, followers, and notifications.

## Features

- **Authentication**: JWT-based authentication with User/Admin roles
- **Posts**: Create, read, update, delete posts with images
- **Social**: Like posts, comment with replies, follow/unfollow users
- **Notifications**: Real-time notifications for follows, likes, and comments
- **Admin Dashboard**: Comprehensive admin panel for user and content management

## Setup

### Prerequisites

- Python 3.8+
- Virtual environment

### Installation

1. **Clone the repository**
   ```bash
   cd mini-gram
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create Admin Account** (First Time Only)
   ```bash
   python create_admin.py
   ```
   Follow the prompts to create the admin account.

5. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## Important Notes

### Admin Access

- **Only ONE admin account** can exist in the system
- Regular users **CANNOT** register as admin
- Admin account must be created using `create_admin.py` script
- All registrations through `/api/auth/register` are forced to `role="user"`

### API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## Project Structure

```
mini-gram/
├── app.py                  # Application entry point
├── create_admin.py         # Admin creation script
├── requirements.txt        # Python dependencies
├── API_DOCUMENTATION.md    # API documentation
├── instance/               # SQLite database
└── src/
    ├── __init__.py         # App factory
    ├── extentions.py       # Flask extensions
    ├── models/             # Database models
    │   ├── user.py
    │   ├── post.py
    │   ├── like.py
    │   ├── comment.py
    │   ├── follow.py
    │   └── notification.py
    ├── routes/             # API endpoints
    │   ├── auth.py
    │   ├── user.py
    │   ├── post.py
    │   ├── interaction.py
    │   ├── admin.py
    │   └── notification.py
    ├── schemas/            # Request validation
    │   ├── auth_schema.py
    │   ├── post_schema.py
    │   └── comment_schema.py
    └── static/
        └── images/         # Uploaded images
```

## Default Credentials

After running `create_admin.py`, use your created credentials to log in as admin.

## API Usage

### Regular User Flow
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (returns JWT token)
3. Use token in `Authorization: Bearer <token>` header

### Admin Flow
1. Login with admin credentials: `POST /api/auth/login`
2. Access admin routes: `/api/admin/*`

## Development

- Database: SQLite (default)
- Authentication: JWT with role-based access control
- File uploads: Local storage in `src/static/images/`

## Notes

- Delete `instance/dabase.db` to reset the database
- Re-run `create_admin.py` after database reset
- All timestamps are in UTC
- Images are stored locally (consider cloud storage for production)
