# Mini-Gram API Documentation

## Overview
Mini-Gram is a Flask-based social media backend API similar to Instagram. It supports user authentication (User/Admin roles), posts with images, likes, comments with replies, and comprehensive admin management features.

**Base URL:** `http://localhost:5000`

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Routes](#user-routes)
3. [Follow/Followers Routes](#followfollowers-routes)
4. [Post Routes](#post-routes)
5. [Interaction Routes](#interaction-routes)
6. [Notification Routes](#notification-routes)
7. [Admin Routes](#admin-routes)
8. [Error Responses](#error-responses)

---

## Authentication

### Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account (all registrations are automatically set as regular users)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `username` (string, required, min: 3, max: 50) - Unique username
  - `email` (string, required) - Valid email address
  - `password` (string, required, min: 6) - Password
  - `bio` (string, optional) - User bio
  - `profile_image` (file, optional) - Profile image (png, jpg, jpeg)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "username=john_doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "bio=Hello, I am John" \
  -F "profile_image=@profile.jpg"
```

**Response (201):**
```json
{
  "msg": "successfully registered"
}
```

**Error Responses:**
- `400` - Missing credentials
- `409` - User already exists
- `422` - Validation error

**Note:** Admin accounts cannot be created through this endpoint. Use the `create_admin.py` script instead.

---

### Login User
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get JWT token

**Request:**
- **Content-Type:** `application/x-www-form-urlencoded`
- **Parameters:**
  - `identifier` (string, required) - Username or email
  - `password` (string, required) - Password

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -d "identifier=john_doe&password=password123"
```

**Response (200):**
```json
{
  "msg": "login successfull",
  "token_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `422` - Validation error

---

## User Routes

### Get User Profile
**Endpoint:** `GET /api/user/<username>`

**Description:** Get user profile by username

**Authentication:** Required (JWT Token)

**Parameters:**
- `username` (path, string) - Username to fetch

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/user/john_doe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Hello, I am John",
  "profile_image": "profile.jpg",
  "created_at": "2025-12-25T10:30:00",
  "total_posts": 5,
  "followers_count": 10,
  "following_count": 15,
  "is_following": false
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized (invalid/missing token)

---

### Get Current User Profile
**Endpoint:** `GET /api/user/me`

**Description:** Get logged-in user's profile

**Authentication:** Required (JWT Token)

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Hello, I am John",
  "profile_image": "profile.jpg",
  "created_at": "2025-12-25T10:30:00",
  "total_posts": 5
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized

---

### Update User Profile
**Endpoint:** `PUT /api/user/update`

**Description:** Update current user's profile

**Authentication:** Required (JWT Token)

**Request:**
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "bio": "Updated bio text"
  }
  ```

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/user/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio"}'
```

**Response (200):**
```json
{
  "msg": "profile updated successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "bio": "Updated bio",
    "profile_image": "profile.jpg",
    "created_at": "2025-12-25T10:30:00"
  }
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized

---

## Follow/Followers Routes

### Follow User
**Endpoint:** `POST /api/user/<username>/follow`

**Description:** Follow another user

**Authentication:** Required (JWT Token)

**Parameters:**
- `username` (path, string) - Username to follow

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/user/jane_doe/follow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (201):**
```json
{
  "msg": "followed successfully"
}
```

**Error Responses:**
- `404` - User not found
- `400` - Cannot follow yourself
- `409` - Already following
- `401` - Unauthorized

---

### Unfollow User
**Endpoint:** `POST /api/user/<username>/unfollow`

**Description:** Unfollow a user

**Authentication:** Required (JWT Token)

**Parameters:**
- `username` (path, string) - Username to unfollow

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/user/jane_doe/unfollow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "unfollowed successfully"
}
```

**Error Responses:**
- `404` - User not found or not following
- `401` - Unauthorized

---

### Get User Followers
**Endpoint:** `GET /api/user/<username>/followers`

**Description:** Get list of users following the specified user

**Authentication:** Required (JWT Token)

**Parameters:**
- `username` (path, string) - Username to get followers for

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Followers per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/user/john_doe/followers?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "username": "john_doe",
  "followers": [
    {
      "id": 2,
      "username": "jane_doe",
      "email": "jane@example.com",
      "bio": "Hi there!",
      "profile_image": "jane.jpg",
      "created_at": "2025-12-25T11:00:00",
      "followers_count": 5,
      "following_count": 3
    }
  ],
  "total": 10,
  "pages": 1,
  "current_page": 1
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized

---

### Get User Following
**Endpoint:** `GET /api/user/<username>/following`

**Description:** Get list of users that the specified user is following

**Authentication:** Required (JWT Token)

**Parameters:**
- `username` (path, string) - Username to get following list for

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Following per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/user/john_doe/following?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "username": "john_doe",
  "following": [
    {
      "id": 3,
      "username": "alice",
      "email": "alice@example.com",
      "bio": "Hello world!",
      "profile_image": "alice.jpg",
      "created_at": "2025-12-25T12:00:00",
      "followers_count": 20,
      "following_count": 10
    }
  ],
  "total": 15,
  "pages": 2,
  "current_page": 1
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized

---

## Post Routes

### Get All Posts
**Endpoint:** `GET /api/posts`

**Description:** Get all posts with pagination

**Authentication:** Required (JWT Token)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Posts per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/posts?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "author_username": "john_doe",
      "title": "My First Post",
      "caption": "This is my first post!",
      "image_url": "post1.jpg",
      "created_at": "2025-12-25T10:30:00",
      "like_count": 5,
      "comment_count": 2
    }
  ],
  "total": 15,
  "pages": 2,
  "current_page": 1
}
```

**Error Responses:**
- `401` - Unauthorized

---

### Get Specific Post
**Endpoint:** `GET /api/posts/<post_id>`

**Description:** Get a specific post by ID

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/posts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "author_username": "john_doe",
  "title": "My First Post",
  "caption": "This is my first post!",
  "image_url": "post1.jpg",
  "created_at": "2025-12-25T10:30:00",
  "like_count": 5,
  "comment_count": 2
}
```

**Error Responses:**
- `404` - Post not found
- `401` - Unauthorized

---

### Create Post
**Endpoint:** `POST /api/posts`

**Description:** Create a new post

**Authentication:** Required (JWT Token)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `title` (string, required, max: 150) - Post title
  - `caption` (string, optional) - Post caption
  - `image_url` (file, optional) - Post image (png, jpg, jpeg)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=My First Post" \
  -F "caption=This is my first post!" \
  -F "image_url=@post.jpg"
```

**Response (201):**
```json
{
  "msg": "post created successfully",
  "post": {
    "id": 1,
    "user_id": 1,
    "author_username": "john_doe",
    "title": "My First Post",
    "caption": "This is my first post!",
    "image_url": "post.jpg",
    "created_at": "2025-12-25T10:30:00",
    "like_count": 0,
    "comment_count": 0
  }
}
```

**Error Responses:**
- `422` - Validation error
- `401` - Unauthorized

---

### Update Post
**Endpoint:** `PUT /api/posts/<post_id>`

**Description:** Update post (title and/or caption)

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Request:**
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `title` (string, optional) - New post title
  - `caption` (string, optional) - New caption

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/posts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Title" \
  -F "caption=Updated caption"
```

**Response (200):**
```json
{
  "msg": "post updated successfully",
  "post": {
    "id": 1,
    "user_id": 1,
    "author_username": "john_doe",
    "title": "Updated Title",
    "caption": "Updated caption",
    "image_url": "post.jpg",
    "created_at": "2025-12-25T10:30:00",
    "like_count": 5,
    "comment_count": 2
  }
}
```

**Error Responses:**
- `404` - Post not found
- `403` - Unauthorized (not post owner)
- `422` - Validation error
- `401` - Unauthorized

---

### Delete Post
**Endpoint:** `DELETE /api/posts/<post_id>`

**Description:** Delete a post

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/posts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "post deleted successfully"
}
```

**Error Responses:**
- `404` - Post not found
- `403` - Unauthorized (not post owner)
- `401` - Unauthorized

---

### Get User's Posts
**Endpoint:** `GET /api/posts/<user_id>/feed`

**Description:** Get all posts by a specific user

**Authentication:** Required (JWT Token)

**Parameters:**
- `user_id` (path, integer) - User ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/posts/1/feed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "username": "john_doe",
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "author_username": "john_doe",
      "title": "My First Post",
      "caption": "This is my first post!",
      "image_url": "post1.jpg",
      "created_at": "2025-12-25T10:30:00",
      "like_count": 5,
      "comment_count": 2
    }
  ]
}
```

**Error Responses:**
- `404` - User not found
- `401` - Unauthorized

---

## Interaction Routes

### Like Post
**Endpoint:** `POST /api/posts/<post_id>/like`

**Description:** Like a post

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/posts/1/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (201):**
```json
{
  "msg": "post liked successfully"
}
```

**Error Responses:**
- `404` - Post not found
- `409` - Post already liked
- `401` - Unauthorized

---

### Unlike Post
**Endpoint:** `POST /api/posts/<post_id>/unlike`

**Description:** Unlike a post

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/posts/1/unlike \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "post unliked successfully"
}
```

**Error Responses:**
- `404` - Post not found
- `401` - Unauthorized

---

### Get Post Likes
**Endpoint:** `GET /api/posts/<post_id>/likes`

**Description:** Get all users who liked a post

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/posts/1/likes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "post_id": 1,
  "like_count": 5,
  "likes": [
    {
      "id": 1,
      "user_id": 2,
      "post_id": 1,
      "created_at": "2025-12-25T10:35:00"
    }
  ]
}
```

**Error Responses:**
- `404` - Post not found
- `401` - Unauthorized

---

### Create Comment
**Endpoint:** `POST /api/posts/<post_id>/comments`

**Description:** Create a comment on a post or reply to a comment

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Request:**
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "content": "Great post!",
    "parent_id": null
  }
  ```
  - `content` (string, required, max: 500) - Comment text
  - `parent_id` (integer, optional) - ID of parent comment (for replies)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/posts/1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'
```

**Response (201):**
```json
{
  "msg": "comment created successfully",
  "comment": {
    "id": 1,
    "user_id": 2,
    "username": "jane_doe",
    "post_id": 1,
    "content": "Great post!",
    "created_at": "2025-12-25T10:40:00"
  }
}
```

**Error Responses:**
- `404` - Post not found / Invalid parent comment
- `422` - Validation error
- `401` - Unauthorized

---

### Get Comment
**Endpoint:** `GET /api/comments/<comment_id>`

**Description:** Get a specific comment

**Authentication:** Required (JWT Token)

**Parameters:**
- `comment_id` (path, integer) - Comment ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/comments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "username": "jane_doe",
  "post_id": 1,
  "content": "Great post!",
  "created_at": "2025-12-25T10:40:00"
}
```

**Error Responses:**
- `404` - Comment not found
- `401` - Unauthorized

---

### Get Post Comments
**Endpoint:** `GET /api/posts/<post_id>/comments`

**Description:** Get all comments on a post (paginated, top-level only)

**Authentication:** Required (JWT Token)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Comments per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/posts/1/comments?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "post_id": 1,
  "comments": [
    {
      "id": 1,
      "user_id": 2,
      "username": "jane_doe",
      "post_id": 1,
      "content": "Great post!",
      "created_at": "2025-12-25T10:40:00"
    }
  ],
  "total": 5,
  "pages": 1,
  "current_page": 1
}
```

**Error Responses:**
- `404` - Post not found
- `401` - Unauthorized

---

### Get Comment Replies
**Endpoint:** `GET /api/comments/<comment_id>/replies`

**Description:** Get all replies to a comment

**Authentication:** Required (JWT Token)

**Parameters:**
- `comment_id` (path, integer) - Parent comment ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/comments/1/replies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "parent_comment_id": 1,
  "replies": [
    {
      "id": 2,
      "user_id": 1,
      "username": "john_doe",
      "post_id": 1,
      "content": "Thanks!",
      "created_at": "2025-12-25T10:45:00"
    }
  ]
}
```

**Error Responses:**
- `404` - Comment not found
- `401` - Unauthorized

---

### Update Comment
**Endpoint:** `PUT /api/comments/<comment_id>`

**Description:** Update a comment

**Authentication:** Required (JWT Token)

**Parameters:**
- `comment_id` (path, integer) - Comment ID

**Request:**
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "content": "Updated comment text"
  }
  ```

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/comments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment text"}'
```

**Response (200):**
```json
{
  "msg": "comment updated successfully",
  "comment": {
    "id": 1,
    "user_id": 2,
    "username": "jane_doe",
    "post_id": 1,
    "content": "Updated comment text",
    "created_at": "2025-12-25T10:40:00"
  }
}
```

**Error Responses:**
- `404` - Comment not found
- `403` - Unauthorized (not comment owner)
- `422` - Validation error
- `401` - Unauthorized

---

### Delete Comment
**Endpoint:** `DELETE /api/comments/<comment_id>`

**Description:** Delete a comment (and all its replies)

**Authentication:** Required (JWT Token)

**Parameters:**
- `comment_id` (path, integer) - Comment ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/comments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "comment deleted successfully"
}
```

**Error Responses:**
- `404` - Comment not found
- `403` - Unauthorized (not comment owner)
- `401` - Unauthorized

---

## Notification Routes

### Get User Notifications
**Endpoint:** `GET /api/notifications`

**Description:** Get current user's notifications with pagination

**Authentication:** Required (JWT Token)

**Query Parameters:**
- `unread_only` (boolean, optional, default: false) - Filter unread notifications only
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Notifications per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/notifications?unread_only=true&page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "actor": {
        "id": 2,
        "username": "jane_doe",
        "profile_image": "jane.jpg"
      },
      "notification_type": "follow",
      "is_read": false,
      "created_at": "2025-12-25T10:30:00"
    },
    {
      "id": 2,
      "user_id": 1,
      "actor": {
        "id": 3,
        "username": "alice",
        "profile_image": "alice.jpg"
      },
      "notification_type": "like",
      "post": {
        "id": 5,
        "title": "Beautiful Sunset"
      },
      "is_read": false,
      "created_at": "2025-12-25T11:00:00"
    },
    {
      "id": 3,
      "user_id": 1,
      "actor": {
        "id": 4,
        "username": "bob",
        "profile_image": "bob.jpg"
      },
      "notification_type": "comment",
      "post": {
        "id": 5,
        "title": "Beautiful Sunset"
      },
      "comment": {
        "id": 10,
        "content": "Amazing photo!"
      },
      "is_read": true,
      "created_at": "2025-12-25T12:00:00"
    }
  ],
  "total": 25,
  "pages": 3,
  "current_page": 1,
  "unread_count": 15
}
```

**Error Responses:**
- `401` - Unauthorized

---

### Get Specific Notification
**Endpoint:** `GET /api/notifications/<notification_id>`

**Description:** Get a specific notification by ID

**Authentication:** Required (JWT Token)

**Parameters:**
- `notification_id` (path, integer) - Notification ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "actor": {
    "id": 2,
    "username": "jane_doe",
    "profile_image": "jane.jpg"
  },
  "notification_type": "follow",
  "is_read": false,
  "created_at": "2025-12-25T10:30:00"
}
```

**Error Responses:**
- `404` - Notification not found
- `403` - Unauthorized (not notification owner)
- `401` - Unauthorized

---

### Mark Notification as Read
**Endpoint:** `PUT /api/notifications/<notification_id>/mark-read`

**Description:** Mark a notification as read

**Authentication:** Required (JWT Token)

**Parameters:**
- `notification_id` (path, integer) - Notification ID

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/1/mark-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "notification marked as read"
}
```

**Error Responses:**
- `404` - Notification not found
- `403` - Unauthorized (not notification owner)
- `401` - Unauthorized

---

### Mark All Notifications as Read
**Endpoint:** `PUT /api/notifications/mark-all-read`

**Description:** Mark all user's notifications as read

**Authentication:** Required (JWT Token)

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "all notifications marked as read"
}
```

**Error Responses:**
- `401` - Unauthorized

---

### Delete Notification
**Endpoint:** `DELETE /api/notifications/<notification_id>`

**Description:** Delete a specific notification

**Authentication:** Required (JWT Token)

**Parameters:**
- `notification_id` (path, integer) - Notification ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/notifications/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "notification deleted"
}
```

**Error Responses:**
- `404` - Notification not found
- `403` - Unauthorized (not notification owner)
- `401` - Unauthorized

---

### Delete All Notifications
**Endpoint:** `DELETE /api/notifications`

**Description:** Delete all user's notifications

**Authentication:** Required (JWT Token)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "all notifications deleted"
}
```

**Error Responses:**
- `401` - Unauthorized

---

## Admin Routes

### Admin Dashboard
**Endpoint:** `GET /api/admin/dashboard`

**Description:** Get admin dashboard statistics

**Authentication:** Required (JWT Token with admin role)

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "total_users": 10,
  "admin_users": 1,
  "regular_users": 9,
  "total_posts": 25,
  "total_comments": 50,
  "total_likes": 100
}
```

**Error Responses:**
- `403` - Admin access required
- `401` - Unauthorized

---

### Get All Users
**Endpoint:** `GET /api/admin/users`

**Description:** Get all users with pagination

**Authentication:** Required (JWT Token with admin role)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Users per page
- `role` (string, optional) - Filter by role: `"user"` or `"admin"`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&per_page=10&role=user" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 2,
      "username": "jane_doe",
      "email": "jane@example.com",
      "bio": "I love photography",
      "profile_image": "jane.jpg",
      "created_at": "2025-12-25T11:00:00"
    }
  ],
  "total": 9,
  "pages": 1,
  "current_page": 1
}
```

**Error Responses:**
- `403` - Admin access required
- `401` - Unauthorized

---

### Get User Details
**Endpoint:** `GET /api/admin/users/<user_id>`

**Description:** Get detailed information about a user

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `user_id` (path, integer) - User ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/users/2 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 2,
  "username": "jane_doe",
  "email": "jane@example.com",
  "bio": "I love photography",
  "profile_image": "jane.jpg",
  "created_at": "2025-12-25T11:00:00",
  "total_posts": 5,
  "total_comments": 10,
  "total_likes": 15
}
```

**Error Responses:**
- `404` - User not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Get User's Posts (Admin)
**Endpoint:** `GET /api/admin/users/<user_id>/posts`

**Description:** Get all posts created by a user

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `user_id` (path, integer) - User ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/users/2/posts \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "username": "jane_doe",
  "posts": [
    {
      "id": 1,
      "user_id": 2,
      "author_username": "jane_doe",
      "title": "Beautiful Sunset",
      "caption": "Captured this amazing sunset!",
      "image_url": "sunset.jpg",
      "created_at": "2025-12-25T11:05:00",
      "like_count": 10,
      "comment_count": 3
    }
  ]
}
```

**Error Responses:**
- `404` - User not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Get User's Comments (Admin)
**Endpoint:** `GET /api/admin/users/<user_id>/comments`

**Description:** Get all comments created by a user

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `user_id` (path, integer) - User ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/users/2/comments \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "username": "jane_doe",
  "comments": [
    {
      "id": 1,
      "user_id": 2,
      "username": "jane_doe",
      "post_id": 1,
      "content": "Beautiful!",
      "created_at": "2025-12-25T11:10:00"
    }
  ]
}
```

**Error Responses:**
- `404` - User not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Delete User
**Endpoint:** `DELETE /api/admin/users/<user_id>/delete`

**Description:** Delete a user and all their content

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `user_id` (path, integer) - User ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/users/2/delete \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "user deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete your own account
- `404` - User not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Get All Posts (Admin)
**Endpoint:** `GET /api/admin/posts`

**Description:** Get all posts with pagination

**Authentication:** Required (JWT Token with admin role)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Posts per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/posts?page=1&per_page=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "user_id": 2,
      "author_username": "jane_doe",
      "title": "Beautiful Sunset",
      "caption": "Captured this amazing sunset!",
      "image_url": "sunset.jpg",
      "created_at": "2025-12-25T11:05:00",
      "like_count": 10,
      "comment_count": 3
    }
  ],
  "total": 25,
  "pages": 3,
  "current_page": 1
}
```

**Error Responses:**
- `403` - Admin access required
- `401` - Unauthorized

---

### Get Post Details (Admin)
**Endpoint:** `GET /api/admin/posts/<post_id>`

**Description:** Get detailed information about a post

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/posts/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "author_username": "jane_doe",
  "title": "Beautiful Sunset",
  "caption": "Captured this amazing sunset!",
  "image_url": "sunset.jpg",
  "created_at": "2025-12-25T11:05:00",
  "like_count": 10,
  "comment_count": 3
}
```

**Error Responses:**
- `404` - Post not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Delete Post (Admin)
**Endpoint:** `DELETE /api/admin/posts/<post_id>/delete`

**Description:** Delete a post

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `post_id` (path, integer) - Post ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/posts/1/delete \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "post deleted successfully"
}
```

**Error Responses:**
- `404` - Post not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Get All Comments (Admin)
**Endpoint:** `GET /api/admin/comments`

**Description:** Get all comments with pagination

**Authentication:** Required (JWT Token with admin role)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `per_page` (integer, optional, default: 10) - Comments per page

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/comments?page=1&per_page=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "user_id": 2,
      "username": "jane_doe",
      "post_id": 1,
      "content": "Beautiful!",
      "created_at": "2025-12-25T11:10:00"
    }
  ],
  "total": 50,
  "pages": 5,
  "current_page": 1
}
```

**Error Responses:**
- `403` - Admin access required
- `401` - Unauthorized

---

### Get Comment Details (Admin)
**Endpoint:** `GET /api/admin/comments/<comment_id>`

**Description:** Get detailed information about a comment

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `comment_id` (path, integer) - Comment ID

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/admin/comments/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "username": "jane_doe",
  "post_id": 1,
  "content": "Beautiful!",
  "created_at": "2025-12-25T11:10:00"
}
```

**Error Responses:**
- `404` - Comment not found
- `403` - Admin access required
- `401` - Unauthorized

---

### Delete Comment (Admin)
**Endpoint:** `DELETE /api/admin/comments/<comment_id>/delete`

**Description:** Delete a comment (and all its replies)

**Authentication:** Required (JWT Token with admin role)

**Parameters:**
- `comment_id` (path, integer) - Comment ID

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/comments/1/delete \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response (200):**
```json
{
  "msg": "comment deleted successfully"
}
```

**Error Responses:**
- `404` - Comment not found
- `403` - Admin access required
- `401` - Unauthorized

---

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
  "msg": "missing credentials"
}
```

#### 401 Unauthorized
```json
{
  "msg": "Missing Authorization Header"
}
```

#### 403 Forbidden
```json
{
  "msg": "unauthorized"
}
```
or
```json
{
  "msg": "admin access required"
}
```

#### 404 Not Found
```json
{
  "msg": "post not found"
}
```

#### 409 Conflict
```json
{
  "msg": "post already liked"
}
```

#### 422 Unprocessable Entity
```json
{
  "msg": {
    "username": ["Missing data for required field."],
    "email": ["Not a valid email address."]
  }
}
```

---

## Authentication Header

All protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## File Upload Guidelines

- **Allowed formats:** PNG, JPG, JPEG
- **Upload location:** `src/static/images/`
- **Maximum file size:** No limit (recommended: < 10MB)

---

## Pagination

Paginated endpoints return:
- `items` or `<resource_name>` array - Data for current page
- `total` - Total number of items
- `pages` - Total number of pages
- `current_page` - Current page number

**Default pagination:** 10 items per page

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- User IDs and post IDs are auto-incremented integers
- Role-based access is enforced at the decorator level
- Cascading deletes are enabled (deleting user deletes their posts/comments)
- Database uses SQLite by default (configurable in `src/__init__.py`)

### Admin Account Creation

**IMPORTANT:** Only ONE admin account can exist in the system. Regular users CANNOT register as admin through the API.

To create the admin account:
1. Run the admin creation script:
   ```bash
   python create_admin.py
   ```
2. Follow the interactive prompts to enter:
   - Admin username
   - Admin email
   - Admin password
   - Admin bio (optional)
   - Profile image path (optional)

If admin already exists, the script allows updating the profile picture.

### Notification Types

Notifications are automatically created for the following events:
- **follow**: When a user follows you
- **like**: When someone likes your post
- **comment**: When someone comments on your post

Notifications include:
- Actor information (who performed the action)
- Related post/comment details (for likes and comments)
- Read/unread status
- Timestamp

Deleting a like or comment automatically removes its associated notification.
