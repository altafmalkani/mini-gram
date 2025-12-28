import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        bio: '',
        profile_image: null
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profile_image') {
            setFormData({ ...formData, profile_image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        if (formData.bio) data.append('bio', formData.bio);
        if (formData.profile_image) data.append('profile_image', formData.profile_image);

        try {
            await register(data);
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.msg || "Registration failed.");
            toast.error("Registration failed");
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center mt-4 mb-4">
            <div className="w-100" style={{ maxWidth: "450px" }}>
                <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                        <h2 className="text-center mb-4" style={{ fontFamily: 'Billabong, cursive', fontSize: '3rem' }}>MiniGram</h2>
                        <p className="text-muted text-center mb-4">Sign up to see photos from your friends.</p>
                        {error && <Alert variant="danger">{JSON.stringify(error)}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    name="username"
                                    type="text" 
                                    placeholder="Username" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    name="email"
                                    type="email" 
                                    placeholder="Email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    name="password"
                                    type="password" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    as="textarea"
                                    name="bio"
                                    placeholder="Bio" 
                                    value={formData.bio} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted">Profile Image (Optional)</Form.Label>
                                <Form.Control 
                                    name="profile_image"
                                    type="file" 
                                    onChange={handleChange} 
                                    accept="image/*"
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Sign Up
                            </Button>
                        </Form>
                        <div className="text-center mt-3 small">
                            Have an account? <Link to="/login">Log In</Link>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default Register;
