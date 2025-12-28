import React, { useState, useEffect } from 'react';
import { Container, Spinner, Button, Alert, Card, Form, Modal, Image, Row, Col } from 'react-bootstrap';
import axiosInstance, { IMAGE_BASE_URL } from '../api/axios';
import PostCard from '../components/PostCard';
import SkeletonPost from '../components/SkeletonPost';
import { useAuth } from '../context/AuthContext';
import { AiOutlinePicture, AiOutlineSend } from 'react-icons/ai';
import { toast } from 'react-toastify';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create Post Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostCaption, setNewPostCaption] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [creatingPost, setCreatingPost] = useState(false);

    const fetchPosts = async (currentPage) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/posts?page=${currentPage}&per_page=10`);
            if (currentPage === 1) {
                setPosts(response.data.posts);
            } else {
                setPosts(prev => [...prev, ...response.data.posts]);
            }
            setTotalPages(response.data.pages);
        } catch (err) {
            setError("Failed to load posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(1);
    }, []);

    const loadMore = () => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPostImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostImage || !newPostTitle) {
            toast.error("Image and Title are required");
            return;
        }

        const formData = new FormData();
        formData.append('title', newPostTitle);
        formData.append('caption', newPostCaption);
        formData.append('image_url', newPostImage);

        setCreatingPost(true);
        try {
            const res = await axiosInstance.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Post created!");
            setPosts([res.data.post, ...posts]); // Add new post to top of feed
            
            // Reset and close modal
            setShowCreateModal(false);
            setNewPostTitle('');
            setNewPostCaption('');
            setNewPostImage(null);
            setImagePreview(null);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to create post");
        } finally {
            setCreatingPost(false);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <Container className="py-4">
            {/* Create Post Shortcut */}
            <Card className="mb-4 shadow-sm border-0 mx-auto" style={{ maxWidth: '600px' }}>
                <Card.Body className="d-flex align-items-center">
                    <Image 
                        src={`${IMAGE_BASE_URL}${user?.profile_image || 'default.jpg'}`} 
                        roundedCircle 
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        className="me-3 border"
                        onError={(e) => { e.target.src = `${IMAGE_BASE_URL}default.jpg`; }}
                    />
                    <div 
                        className="flex-grow-1 bg-light rounded-pill px-3 py-2 text-muted cursor-pointer border"
                        onClick={() => setShowCreateModal(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        What's on your mind, {user?.username}?
                    </div>
                    <Button 
                        variant="link" 
                        className="text-success ms-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <AiOutlinePicture size={24} />
                    </Button>
                </Card.Body>
            </Card>

            {/* Create Post Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreatePost}>
                        <div className="text-center mb-3">
                            {imagePreview ? (
                                <div className="position-relative">
                                    <Image src={imagePreview} fluid rounded style={{ maxHeight: '300px' }} />
                                    <Button 
                                        variant="light" 
                                        size="sm" 
                                        className="position-absolute top-0 end-0 m-2 shadow-sm"
                                        onClick={() => { setNewPostImage(null); setImagePreview(null); }}
                                    >
                                        &times;
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    className="border rounded p-4 bg-light text-center cursor-pointer"
                                    style={{ borderStyle: 'dashed !important' }}
                                    onClick={() => document.getElementById('modal-post-image').click()}
                                >
                                    <AiOutlinePicture size={40} className="text-muted mb-2" />
                                    <p className="mb-0 text-muted small">Select an image to upload</p>
                                </div>
                            )}
                            <Form.Control 
                                id="modal-post-image"
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="d-none"
                            />
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Control 
                                type="text" 
                                placeholder="Title (Required)" 
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                placeholder="Write a caption..." 
                                value={newPostCaption}
                                onChange={(e) => setNewPostCaption(e.target.value)}
                            />
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 d-flex align-items-center justify-content-center"
                            disabled={creatingPost}
                        >
                            {creatingPost ? <Spinner size="sm" animation="border" className="me-2" /> : <AiOutlineSend className="me-2" />}
                            Share Post
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {error && <Alert variant="danger">{error}</Alert>}
            
            {loading && page === 1 ? (
                <>
                    <SkeletonPost />
                    <SkeletonPost />
                    <SkeletonPost />
                </>
            ) : (
                posts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                ))
            )}
            
            {loading && page > 1 && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {!loading && page < totalPages && (
                <div className="text-center my-4">
                    <Button variant="outline-primary" onClick={loadMore}>Load More</Button>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center mt-5">
                    <h3>No posts yet. Follow some users to see their posts!</h3>
                </div>
            )}
        </Container>
    );
};

export default Home;