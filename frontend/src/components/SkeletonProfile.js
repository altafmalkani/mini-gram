import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const SkeletonProfile = () => {
    return (
        <Container className="py-4" style={{ maxWidth: '935px' }}>
            <Row className="mb-5 align-items-center">
                <Col xs={4} md={4} className="text-center">
                    <div className="skeleton skeleton-circle mx-auto" style={{ width: '150px', height: '150px' }}></div>
                </Col>
                <Col xs={8} md={8}>
                    <div className="skeleton skeleton-title mb-3" style={{ width: '200px' }}></div>
                    <div className="d-flex gap-4 mb-3">
                        <div className="skeleton skeleton-text" style={{ width: '60px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '80px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '80px' }}></div>
                    </div>
                    <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '300px' }}></div>
                </Col>
            </Row>
            <div className="border-top pt-4">
                <Row>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Col key={i} xs={4} className="mb-4 p-1 p-md-2">
                            <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: '4px' }}></div>
                        </Col>
                    ))}
                </Row>
            </div>
        </Container>
    );
};

export default SkeletonProfile;
