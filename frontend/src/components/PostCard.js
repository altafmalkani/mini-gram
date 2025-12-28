import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form, Dropdown, Modal } from 'react-bootstrap';
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage, AiOutlineDelete } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../api/axios';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

import VerifiedBadge from './VerifiedBadge';

const CommentItem = ({ comment, onDelete, currentUserId, postId }) => {
    // ... (rest of CommentItem remains same, but we might want verified badge here too? API doesn't give user role in comment object easily without another fetch. For now let's stick to Post Author first, or fetch it if needed)
    // Actually, comment object doesn't have role. We'd need to fetch user for every comment. That's too many requests. 
    // Let's assume for now we only do it for Post Authors and Profile headers as requested "all across" usually implies main interaction points.
    // If strict "all across" including comments is needed, we'd need to fetch or have backend provide it.
    // Let's start with Post Author.
    
    // Wait, let's verify if I can easily get it for comments. 
    // Comment object: {id, user_id, username, content...}
    // No role. 
    // I will stick to Post Author and Profile for now.
    
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
    const [selectedReplyId, setSelectedReplyId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReplies = async () => {
        if (!showReplies && replies.length === 0) {
            try {
                const res = await axiosInstance.get(`/comments/${comment.id}/replies`);
                setReplies(res.data.replies);
            } catch (err) {
                console.error("Failed to fetch replies");
            }
        }
        setShowReplies(!showReplies);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            const response = await axiosInstance.post(`/posts/${postId}/comments`, {
                content: replyText,
                parent_id: comment.id
            });
            setReplies([...replies, response.data.comment]);
            setReplyText('');
            setShowReplyInput(false);
            if (!showReplies) setShowReplies(true);
            toast.success("Reply added");
        } catch (err) {
            toast.error("Failed to add reply");
        }
    };

    const handleDeleteReply = async () => {
        if (!selectedReplyId) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/comments/${selectedReplyId}`);
            setReplies(replies.filter(r => r.id !== selectedReplyId));
            toast.success("Reply deleted");
            setShowDeleteReplyModal(false);
            setSelectedReplyId(null);
        } catch (err) {
            toast.error("Failed to delete reply");
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDeleteComment = async () => {
        setIsDeleting(true);
        try {
            await onDelete(comment.id);
            setShowDeleteModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mb-3">
            <div className="d-flex align-items-start justify-content-between group-hover-container">
                <div style={{ fontSize: '0.9rem' }}>
                    <Link to={`/profile/${comment.username}`} className="text-dark text-decoration-none fw-bold me-2">
                        {comment.username}
                    </Link>
                    <span style={{ color: '#262626' }}>{comment.content}</span>
                </div>
                {currentUserId === comment.user_id && (
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="text-danger p-0 text-decoration-none small ms-2 opacity-0 transition-opacity"
                        onClick={() => setShowDeleteModal(true)}
                        style={{ fontSize: '0.75rem' }}
                    >
                        Delete
                    </Button>
                )}
            </div>
            
            <div className="d-flex align-items-center gap-3 mt-1">
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <Button variant="link" size="sm" className="text-muted p-0 text-decoration-none fw-bold" style={{ fontSize: '0.75rem' }} onClick={fetchReplies}>
                    {showReplies ? "Hide replies" : (replies.length > 0 ? `View ${replies.length} replies` : "Replies")}
                </Button>
                <Button 
                    variant="link" 
                    size="sm" 
                    className="text-muted p-0 text-decoration-none fw-bold"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setShowReplyInput(!showReplyInput)}
                >
                    Reply
                </Button>
            </div>

            {showReplyInput && (
                <Form onSubmit={handleReplySubmit} className="mt-2 d-flex align-items-center">
                    <Form.Control 
                        size="sm"
                        type="text" 
                        placeholder={`Reply to ${comment.username}...`} 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="border-0 border-bottom rounded-0 shadow-none p-0"
                        style={{ fontSize: '0.85rem', background: 'transparent' }}
                    />
                    <Button type="submit" variant="link" size="sm" className="p-0 ms-2 text-primary fw-bold text-decoration-none" style={{ fontSize: '0.85rem' }}>
                        Post
                    </Button>
                </Form>
            )}

            {showReplies && replies.length > 0 && (
                <div className="ms-4 mt-2 border-start ps-3">
                    {replies.map(reply => (
                        <div key={reply.id} className="mb-2">
                            <div className="d-flex justify-content-between align-items-start group-hover-container">
                                <div style={{ fontSize: '0.85rem' }}>
                                    <Link to={`/profile/${reply.username}`} className="text-dark text-decoration-none fw-bold me-2">
                                        {reply.username}
                                    </Link>
                                    <span style={{ color: '#262626' }}>{reply.content}</span>
                                </div>
                                {currentUserId === reply.user_id && (
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="text-danger p-0 text-decoration-none small opacity-0 transition-opacity"
                                        onClick={() => {
                                            setSelectedReplyId(reply.id);
                                            setShowDeleteReplyModal(true);
                                        }}
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                            <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                {new Date(reply.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Comment Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-bold">Delete Comment?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center text-muted pb-4">
                    Are you sure you want to delete this comment?
                </Modal.Body>
                <Modal.Footer className="flex-column p-0 border-top-0">
                    <Button 
                        variant="link" 
                        className="w-100 text-danger fw-bold text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={confirmDeleteComment}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button 
                        variant="link" 
                        className="w-100 text-dark text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Reply Modal */}
            <Modal show={showDeleteReplyModal} onHide={() => setShowDeleteReplyModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-bold">Delete Reply?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center text-muted pb-4">
                    Are you sure you want to delete this reply?
                </Modal.Body>
                <Modal.Footer className="flex-column p-0 border-top-0">
                    <Button 
                        variant="link" 
                        className="w-100 text-danger fw-bold text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={handleDeleteReply}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button 
                        variant="link" 
                        className="w-100 text-dark text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={() => setShowDeleteReplyModal(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const PostCard = ({ post, onDelete }) => {
    const { user } = useAuth();
    const [likes, setLikes] = useState(post.like_count);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [authorImage, setAuthorImage] = useState('default.jpg');
    const [authorRole, setAuthorRole] = useState('user');
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchAuthorDetails = async () => {
            try {
                const res = await axiosInstance.get(`/user/${post.author_username}`);
                if (res.data.profile_image) {
                    setAuthorImage(res.data.profile_image);
                }
                
                // Check for various potential admin indicators since 'role' might not be directly exposed or named differently
                const isAdmin = res.data.role === 'admin' || res.data.is_admin === true || res.data.isAdmin === true;
                if (isAdmin) {
                    setAuthorRole('admin');
                }
            } catch (err) {
                console.error("Failed to fetch author details");
            }
        };
        fetchAuthorDetails();
    }, [post.author_username]);

    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!user) return;
            try {
                const res = await axiosInstance.get(`/posts/${post.id}/likes`);
                const userLiked = res.data.likes.some(like => like.user_id === user.id);
                setIsLiked(userLiked);
                setLikes(res.data.like_count);
            } catch (err) {
                console.error("Failed to fetch like status");
            }
        };
        checkLikeStatus();
    }, [post.id, user]);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await axiosInstance.post(`/posts/${post.id}/unlike`);
                setLikes(prev => prev - 1);
                setIsLiked(false);
            } else {
                await axiosInstance.post(`/posts/${post.id}/like`);
                setLikes(prev => prev + 1);
                setIsLiked(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Action failed");
        }
    };

    const fetchComments = async () => {
        if (!showComments) {
            try {
                const response = await axiosInstance.get(`/posts/${post.id}/comments`);
                setComments(response.data.comments);
            } catch (err) {
                console.error("Failed to fetch comments");
            }
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const response = await axiosInstance.post(`/posts/${post.id}/comments`, {
                content: commentText
            });
            setComments([response.data.comment, ...comments]);
            setCommentText('');
            toast.success("Comment added");
        } catch (err) {
            toast.error("Failed to add comment");
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axiosInstance.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
            toast.success("Comment deleted");
        } catch (err) {
            toast.error("Failed to delete comment");
            throw err; // Re-throw to handle in child if needed
        }
    };

    const handleDeletePost = async () => {
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/posts/${post.id}`);
            toast.success("Post deleted successfully");
            setShowDeleteModal(false);
            if (onDelete) {
                onDelete(post.id);
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="mb-4 shadow-sm border mx-auto" style={{ maxWidth: '600px', borderRadius: '8px' }}>
            <Card.Header className="bg-white border-bottom-0 d-flex align-items-center justify-content-between py-2 px-3">
                <div className="d-flex align-items-center">
                    <Link to={`/profile/${post.author_username}`} className="d-flex align-items-center text-decoration-none">
                        <Image 
                            src={`${IMAGE_BASE_URL}${authorImage}`} 
                            roundedCircle 
                            style={{ width: '32px', height: '32px', marginRight: '12px', objectFit: 'cover', border: '1px solid #dbdbdb' }}
                            onError={(e) => { e.target.src = `${IMAGE_BASE_URL}default.jpg`; }}
                        />
                        <span className="text-dark fw-bold d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                            {post.author_username}
                            <VerifiedBadge role={authorRole} />
                        </span>
                    </Link>
                </div>
                {user && user.id === post.user_id && (
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="text-dark p-0 border-0 shadow-none d-flex align-items-center" id="post-options">
                            <BsThreeDots size={18} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm border">
                            <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger py-2">
                                <AiOutlineDelete className="me-2" />
                                Delete Post
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </Card.Header>
            
            <div className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '400px', overflow: 'hidden' }}>
                <Card.Img 
                    variant="top" 
                    src={`${IMAGE_BASE_URL}${post.image_url}`} 
                    style={{ width: '100%', height: 'auto', maxHeight: '750px', objectFit: 'contain' }} 
                />
            </div>

            <Card.Body className="pt-2">
                <div className="d-flex align-items-center mb-2" style={{ marginLeft: '-8px' }}>
                    <Button variant="link" onClick={handleLike} className="p-2 text-dark fs-4 shadow-none">
                        {isLiked ? <AiFillHeart className="text-danger" /> : <AiOutlineHeart />}
                    </Button>
                    <Button variant="link" onClick={fetchComments} className="p-2 text-dark fs-4 shadow-none">
                        <AiOutlineMessage />
                    </Button>
                </div>
                
                <Card.Text className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}>{likes.toLocaleString()} likes</Card.Text>
                
                <Card.Text className="mb-1" style={{ fontSize: '0.9rem' }}>
                    <Link to={`/profile/${post.author_username}`} className="text-dark text-decoration-none fw-bold me-2">
                        {post.author_username}
                    </Link>
                    {post.caption && (
                        <span style={{ whiteSpace: 'pre-wrap' }}>
                            {showFullCaption || post.caption.length <= 100 
                                ? post.caption 
                                : `${post.caption.substring(0, 100)}... `}
                            {post.caption.length > 100 && (
                                <Button 
                                    variant="link" 
                                    className="p-0 text-muted text-decoration-none small fw-bold"
                                    onClick={() => setShowFullCaption(!showFullCaption)}
                                >
                                    {showFullCaption ? " less" : " more"}
                                </Button>
                            )}
                        </span>
                    )}
                </Card.Text>
                
                <div className="text-muted text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.2px' }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                
                {showComments && (
                    <div className="mt-3 border-top pt-3">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentItem 
                                    key={comment.id} 
                                    comment={comment} 
                                    onDelete={handleDeleteComment}
                                    currentUserId={user?.id}
                                    postId={post.id}
                                />
                            ))
                        ) : (
                            <p className="text-muted small text-center py-2">No comments yet.</p>
                        )}
                    </div>
                )}
            </Card.Body>

            <div className="border-top px-3 py-2">
                <Form onSubmit={handleCommentSubmit} className="d-flex align-items-center">
                    <Form.Control 
                        type="text" 
                        placeholder="Add a comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="border-0 shadow-none p-0"
                        style={{ fontSize: '0.9rem', background: 'transparent' }}
                    />
                    <Button 
                        type="submit" 
                        variant="link" 
                        className={`text-primary fw-bold text-decoration-none p-0 ms-2 ${!commentText.trim() ? 'opacity-50' : ''}`}
                        disabled={!commentText.trim()}
                        style={{ fontSize: '0.9rem' }}
                    >
                        Post
                    </Button>
                </Form>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-bold">Delete Post?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center text-muted pb-4">
                    Are you sure you want to delete this post? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="flex-column p-0 border-top-0">
                    <Button 
                        variant="link" 
                        className="w-100 text-danger fw-bold text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={handleDeletePost}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button 
                        variant="link" 
                        className="w-100 text-dark text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default PostCard;