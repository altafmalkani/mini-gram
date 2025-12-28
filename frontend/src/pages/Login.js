import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(identifier, password);
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
            toast.success("Login successful!");
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed. Check your credentials.");
            toast.error("Login failed");
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                        <h2 className="text-center mb-4 font-weight-bold" style={{ fontFamily: 'Billabong, cursive', fontSize: '3rem' }}>MiniGram</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Username or Email" 
                                    value={identifier} 
                                    onChange={(e) => setIdentifier(e.target.value)} 
                                    required 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Log In
                            </Button>
                        </Form>
                        <div className="text-center mt-3 small">
                            Don't have an account? <Link to="/register">Sign Up</Link>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default Login;
