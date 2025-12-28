import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Image, Button, Spinner, Alert } from 'react-bootstrap';
import axiosInstance, { IMAGE_BASE_URL } from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notifications');
            setNotifications(response.data.notifications);
        } catch (err) {
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await axiosInstance.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to update notifications");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.info("Notification deleted");
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-4" style={{ maxWidth: '700px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Notifications</h2>
                {notifications.some(n => !n.is_read) && (
                    <Button variant="link" onClick={markAllRead} className="text-primary fw-bold text-decoration-none p-0">
                        Mark all as read
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <ListGroup variant="flush">
                    {notifications.map(n => (
                        <ListGroup.Item key={n.id} className={`border-0 mb-2 rounded shadow-sm d-flex align-items-center justify-content-between ${!n.is_read ? 'bg-light border-start border-primary border-4' : ''}`}>
                            <div className="d-flex align-items-center">
                                <Image 
                                    src={`${IMAGE_BASE_URL}${n.actor.profile_image || 'default.jpg'}`} 
                                    roundedCircle 
                                    className="me-3"
                                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                                />
                                <div>
                                    <Link to={`/profile/${n.actor.username}`} className="fw-bold text-dark text-decoration-none me-1">
                                        {n.actor.username}
                                    </Link>
                                    <span className="text-muted">
                                        {n.notification_type === 'follow' && "started following you."}
                                        {n.notification_type === 'like' && `liked your post: "${n.post?.title}".`}
                                        {n.notification_type === 'comment' && `commented on your post: "${n.comment?.content}".`}
                                    </span>
                                    <div className="small text-muted mt-1">{new Date(n.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                            <Button variant="link" className="text-danger p-0" onClick={() => deleteNotification(n.id)}>
                                &times;
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
};

export default Notifications;
