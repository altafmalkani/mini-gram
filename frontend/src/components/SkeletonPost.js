import React from 'react';
import { Card, Container } from 'react-bootstrap';

const SkeletonPost = () => {
    return (
        <Card className="mb-4 shadow-sm border mx-auto" style={{ maxWidth: '600px', borderRadius: '8px' }}>
            <Card.Header className="bg-white border-bottom-0 d-flex align-items-center py-2 px-3">
                <div className="skeleton skeleton-circle me-3" style={{ width: '32px', height: '32px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
            </Card.Header>
            <div className="skeleton skeleton-image"></div>
            <Card.Body>
                <div className="d-flex gap-3 mb-3">
                    <div className="skeleton skeleton-circle" style={{ width: '24px', height: '24px' }}></div>
                    <div className="skeleton skeleton-circle" style={{ width: '24px', height: '24px' }}></div>
                </div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            </Card.Body>
        </Card>
    );
};

export default SkeletonPost;
