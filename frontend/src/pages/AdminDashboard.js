import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Tabs, Tab, Spinner, Modal } from 'react-bootstrap';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState(null); // 'user', 'post', or 'comment'
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, postsRes, commentsRes] = await Promise.all([
                axiosInstance.get('/admin/dashboard'),
                axiosInstance.get('/admin/users'),
                axiosInstance.get('/admin/posts'),
                axiosInstance.get('/admin/comments')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setPosts(postsRes.data.posts);
            setComments(commentsRes.data.comments);
        } catch (err) {
            toast.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = (id) => {
        setDeleteId(id);
        setDeleteType('user');
        setShowDeleteModal(true);
    };

    const handleDeletePost = (id) => {
        setDeleteId(id);
        setDeleteType('post');
        setShowDeleteModal(true);
    };

    const handleDeleteComment = (id) => {
        setDeleteId(id);
        setDeleteType('comment');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId || !deleteType) return;
        
        setIsDeleting(true);
        try {
            if (deleteType === 'user') {
                await axiosInstance.delete(`/admin/users/${deleteId}/delete`);
                setUsers(users.filter(u => u.id !== deleteId));
                toast.success("User deleted");
            } else if (deleteType === 'post') {
                await axiosInstance.delete(`/admin/posts/${deleteId}/delete`);
                setPosts(posts.filter(p => p.id !== deleteId));
                toast.success("Post deleted");
            } else if (deleteType === 'comment') {
                await axiosInstance.delete(`/admin/comments/${deleteId}/delete`);
                setComments(comments.filter(c => c.id !== deleteId));
                toast.success("Comment deleted");
            }
            setShowDeleteModal(false);
        } catch (err) {
            toast.error(err.response?.data?.msg || `Failed to delete ${deleteType}`);
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-4">
            <h1 className="mb-4">Admin Dashboard</h1>
            
            {stats && (
                <Row className="mb-4">
                    <Col md={3} className="mb-3">
                        <Card className="text-center bg-primary text-white shadow-sm border-0">
                            <Card.Body>
                                <Card.Title>Total Users</Card.Title>
                                <h2>{stats.total_users}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                        <Card className="text-center bg-success text-white shadow-sm border-0">
                            <Card.Body>
                                <Card.Title>Total Posts</Card.Title>
                                <h2>{stats.total_posts}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                        <Card className="text-center bg-info text-white shadow-sm border-0">
                            <Card.Body>
                                <Card.Title>Comments</Card.Title>
                                <h2>{stats.total_comments}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                        <Card className="text-center bg-danger text-white shadow-sm border-0">
                            <Card.Body>
                                <Card.Title>Total Likes</Card.Title>
                                <h2>{stats.total_likes}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Tabs defaultActiveKey="users" className="mb-4 custom-tabs">
                <Tab eventKey="users" title="Users">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.username}</td>
                                            <td>{u.email}</td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="posts" title="Posts">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Author</th>
                                        <th>Title</th>
                                        <th>Likes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.author_username}</td>
                                            <td>{p.title}</td>
                                            <td>{p.like_count}</td>
                                            <td>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeletePost(p.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="comments" title="Comments">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Content</th>
                                        <th>Post ID</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comments.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>{c.username}</td>
                                            <td style={{ maxWidth: '300px' }} className="text-truncate">{c.content}</td>
                                            <td>{c.post_id}</td>
                                            <td>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => !isDeleting && setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-bold text-capitalize">Delete {deleteType}?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center text-muted pb-4">
                    Are you sure you want to delete this {deleteType}? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="flex-column p-0 border-top-0">
                    <Button 
                        variant="link" 
                        className="w-100 text-danger fw-bold text-decoration-none border-top py-3 m-0 rounded-0"
                        onClick={confirmDelete}
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
        </Container>
    );
};

export default AdminDashboard;
