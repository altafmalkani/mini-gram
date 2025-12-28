import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import axiosInstance, { IMAGE_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PostCard from '../components/PostCard';
import SkeletonProfile from '../components/SkeletonProfile';
import VerifiedBadge from '../components/VerifiedBadge';
import { AiFillHeart, AiFillMessage, AiOutlineTable, AiOutlineClose, AiOutlineCamera } from 'react-icons/ai';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [followLoading, setFollowLoading] = useState(false);

    // Edit Profile Picture State
    const [editProfileImage, setEditProfileImage] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(null);
    
    // Follows Modal State
    const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' or 'following' or null
    const [followList, setFollowList] = useState([]);
    const [followListLoading, setFollowListLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userRes = await axiosInstance.get(`/user/${username}`);
            const userData = userRes.data;
            
            // Normalize admin status
            if (userData.is_admin === true || userData.isAdmin === true) {
                userData.role = 'admin';
            }
            
            setProfile(userData);
            setEditBio(userData.bio || '');
            
            const postsRes = await axiosInstance.get(`/posts/${userData.id}/feed`);
            setPosts(postsRes.data.posts);
        } catch (err) {
            setError(err.response?.data?.msg || "User not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (profile.is_following) {
                await axiosInstance.post(`/user/${username}/unfollow`);
                setProfile({ ...profile, is_following: false, followers_count: profile.followers_count - 1 });
                toast.info(`Unfollowed ${username}`);
            } else {
                await axiosInstance.post(`/user/${username}/follow`);
                setProfile({ ...profile, is_following: true, followers_count: profile.followers_count + 1 });
                toast.success(`Followed ${username}`);
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditProfileImage(file);
            setPreviewProfileImage(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Update Bio
            if (editBio !== profile.bio) {
                await axiosInstance.put('/user/update', { bio: editBio });
            }

            // Update Profile Picture
            if (editProfileImage) {
                const formData = new FormData();
                formData.append('profile_image', editProfileImage);
                await axiosInstance.put('/user/profile-picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Refresh profile data
            const userRes = await axiosInstance.get(`/user/${username}`);
            const userData = userRes.data;
            if (userData.is_admin === true || userData.isAdmin === true) {
                 userData.role = 'admin';
            }
            setProfile(userData);

            setShowEditModal(false);
            setEditProfileImage(null);
            setPreviewProfileImage(null);
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to update profile");
        }
    };

    const openFollowModal = async (type) => {
        setShowFollowModal(type);
        setFollowListLoading(true);
        try {
            // API endpoints: /user/<username>/followers OR /user/<username>/following
            const res = await axiosInstance.get(`/user/${username}/${type}`);
            // The API returns { followers: [...] } or { following: [...] }
            setFollowList(res.data[type] || []);
        } catch (err) {
            toast.error(`Failed to fetch ${type}`);
            setShowFollowModal(null);
        } finally {
            setFollowListLoading(false);
        }
    };
    const handleDeletePost = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
        setSelectedPost(null); // Close modal after deletion
    };

    if (loading) return <SkeletonProfile />;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    const isOwnProfile = currentUser?.username === username;

    return (
        <Container className="py-4" style={{ maxWidth: '935px' }}>
            <Row className="mb-5 align-items-center">
                <Col xs={4} md={4} className="text-center">
                    <Image 
                        src={`${IMAGE_BASE_URL}${profile.profile_image || 'default.jpg'}`} 
                        roundedCircle 
                        className="border shadow-sm p-1 bg-white profile-img-responsive"
                        onError={(e) => { e.target.src = `${IMAGE_BASE_URL}default.jpg`; }}
                    />
                </Col>
                <Col xs={8} md={8}>
                    <div className="d-flex align-items-center mb-3 flex-wrap gap-3">
                        <h2 className="me-2 mb-0 fw-light d-flex align-items-center">
                            {profile.username}
                            <VerifiedBadge role={profile.role} />
                        </h2>
                        {!isOwnProfile && (
                            <Button 
                                variant={profile.is_following ? "outline-secondary" : "primary"}
                                onClick={handleFollow}
                                size="sm"
                                className="fw-bold px-4"
                                disabled={followLoading}
                            >
                                {followLoading ? <Spinner size="sm" animation="border" /> : (profile.is_following ? "Unfollow" : "Follow")}
                            </Button>
                        )}
                        {isOwnProfile && (
                            <Button 
                                variant="outline-dark" 
                                size="sm" 
                                className="fw-bold px-3"
                                onClick={() => setShowEditModal(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                    <div className="d-flex gap-4 mb-3">
                        <div><span className="fw-bold">{profile.total_posts}</span> posts</div>
                        <div 
                            className="cursor-pointer" 
                            onClick={() => openFollowModal('followers')}
                        >
                            <span className="fw-bold">{profile.followers_count}</span> followers
                        </div>
                        <div 
                            className="cursor-pointer" 
                            onClick={() => openFollowModal('following')}
                        >
                            <span className="fw-bold">{profile.following_count}</span> following
                        </div>
                    </div>
                    <div>
                        <span className="fw-bold d-block mb-1">{profile.username}</span>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{profile.bio || "No bio available."}</p>
                    </div>
                </Col>
            </Row>

            <div className="border-top mb-3">
                <div className="d-flex justify-content-center">
                    <div className="border-top border-dark pt-2 d-flex align-items-center text-uppercase small fw-bold" style={{ letterSpacing: '1px', marginTop: '-1px' }}>
                        <AiOutlineTable className="fs-5 me-2" /> Posts
                    </div>
                </div>
            </div>

            <Row>
                {posts.length === 0 ? (
                    <Col className="text-center py-5">
                        <div className="display-1 text-muted mb-3"><AiOutlineTable /></div>
                        <h4 className="fw-light">No Posts Yet</h4>
                    </Col>
                ) : (
                    posts.map(post => (
                        <Col key={post.id} xs={4} className="mb-4 p-1 p-md-2">
                            <div 
                                className="ratio ratio-1x1 overflow-hidden shadow-sm rounded profile-post-container"
                                onClick={() => setSelectedPost(post)}
                            >
                                <Image 
                                    src={`${IMAGE_BASE_URL}${post.image_url}`} 
                                    className="img-fluid object-fit-cover"
                                />
                                <div className="profile-post-overlay">
                                    <span className="me-4"><AiFillHeart className="me-2" /> {post.like_count}</span>
                                    <span><AiFillMessage className="me-2" /> {post.comment_count}</span>
                                </div>
                            </div>
                        </Col>
                    ))
                )}
            </Row>

            {/* Edit Profile Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditProfileImage(null); setPreviewProfileImage(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateProfile}>
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block">
                                <Image 
                                    src={previewProfileImage || `${IMAGE_BASE_URL}${profile.profile_image || 'default.jpg'}`} 
                                    roundedCircle 
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    className="border"
                                />
                                <div 
                                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 cursor-pointer d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                                    onClick={() => document.getElementById('profile-image-upload').click()}
                                >
                                    <AiOutlineCamera />
                                </div>
                            </div>
                            <Form.Control 
                                id="profile-image-upload"
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="d-none"
                            />
                            <div 
                                className="mt-2 text-primary fw-bold small cursor-pointer"
                                onClick={() => document.getElementById('profile-image-upload').click()}
                                style={{ cursor: 'pointer' }}
                            >
                                Change Profile Photo
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={editBio} 
                                onChange={(e) => setEditBio(e.target.value)} 
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Follow/Following List Modal */}
            <Modal show={!!showFollowModal} onHide={() => setShowFollowModal(null)} centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title className="text-capitalize">{showFollowModal}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ minHeight: '300px' }}>
                    {followListLoading ? (
                        <div className="text-center mt-5"><Spinner animation="border" /></div>
                    ) : (
                        followList.length === 0 ? (
                            <div className="text-center mt-5 text-muted">No users found.</div>
                        ) : (
                            <ul className="list-unstyled">
                                {followList.map(u => (
                                    <li key={u.id} className="d-flex align-items-center mb-3">
                                        <Image 
                                            src={`${IMAGE_BASE_URL}${u.profile_image || 'default.jpg'}`} 
                                            roundedCircle 
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            className="me-3 border"
                                            onError={(e) => { e.target.src = `${IMAGE_BASE_URL}default.jpg`; }}
                                        />
                                        <div className="flex-grow-1">
                                            <Link 
                                                to={`/profile/${u.username}`} 
                                                className="text-dark text-decoration-none fw-bold d-block"
                                                onClick={() => setShowFollowModal(null)} // Close modal on navigate
                                            >
                                                {u.username}
                                            </Link>
                                            <small className="text-muted">{u.bio ? u.bio.substring(0, 30) + (u.bio.length > 30 ? '...' : '') : ''}</small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                </Modal.Body>
            </Modal>

            {/* Post Detail Modal */}
            <Modal 
                show={!!selectedPost} 
                onHide={() => setSelectedPost(null)} 
                centered 
                size="lg"
                contentClassName="bg-transparent border-0"
            >
                {selectedPost && (
                    <div className="position-relative" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                        <Button 
                            variant="link" 
                            className="position-absolute top-0 end-0 text-white p-2" 
                            style={{ zIndex: 1050, right: '-30px', top: '-30px' }}
                            onClick={() => setSelectedPost(null)}
                        >
                            <AiOutlineClose size={24} />
                        </Button>
                        <PostCard post={selectedPost} onDelete={handleDeletePost} />
                    </div>
                )}
            </Modal>
        </Container>
    );
};

export default Profile;