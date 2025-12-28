import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AiFillHome, AiOutlinePlusSquare, AiOutlineBell, AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import VerifiedBadge from './VerifiedBadge';

const Navigation = () => {
    const { isAuthenticated, logout, role, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    return (
        <Navbar bg="white" expand="lg" className="border-bottom sticky-top mb-4 py-1 main-navbar">
            <Container>
                <Navbar.Brand as={Link} to="/" className="py-0 navbar-brand-custom" style={{ fontFamily: 'Billabong, cursive', fontSize: '2.2rem' }}>
                    MiniGram
                </Navbar.Brand>
                <Nav className="ms-auto flex-row align-items-center justify-content-around w-mobile-100">
                    <Nav.Link as={Link} to="/" className="px-2 text-dark fs-4 d-flex align-items-center"><AiFillHome /></Nav.Link>
                    <Nav.Link as={Link} to="/create-post" className="px-2 text-dark fs-4 d-flex align-items-center"><AiOutlinePlusSquare /></Nav.Link>
                    <Nav.Link as={Link} to="/notifications" className="px-2 text-dark fs-4 d-flex align-items-center"><AiOutlineBell /></Nav.Link>
                    <Nav.Link as={Link} to={`/profile/${user?.username}`} className="px-2 text-dark fs-4 d-flex align-items-center"><AiOutlineUser /></Nav.Link>
                    
                    {/* Mobile Logout Icon */}
                    <Nav.Link onClick={handleLogout} className="px-2 text-dark fs-4 d-flex align-items-center d-md-none">
                        <AiOutlineLogout />
                    </Nav.Link>

                    {role === 'admin' && (
                        <Nav.Link as={Link} to="/admin" className="px-2 text-danger fw-bold d-flex align-items-center admin-link" style={{ fontSize: '0.85rem' }}>
                            Admin <VerifiedBadge role={role} />
                        </Nav.Link>
                    )}
                    <div className="ms-2 ps-2 border-start logout-container">
                        <Button 
                            variant="link" 
                            onClick={handleLogout} 
                            className="text-dark text-decoration-none p-0 fw-bold"
                            style={{ fontSize: '0.9rem' }}
                        >
                            Logout
                        </Button>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default Navigation;
