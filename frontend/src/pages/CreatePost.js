import React, { useState } from 'react';
import { Container, Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { AiOutlineCloudUpload } from 'react-icons/ai';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image || !title) {
            toast.error("Image and Title are required");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('caption', caption);
        formData.append('image_url', image);

        try {
            setLoading(true);
            await axiosInstance.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Post created successfully!");
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom p-3">
                    <h5 className="mb-0 text-center">Create New Post</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            {preview ? (
                                <div className="position-relative">
                                    <Image src={preview} fluid className="rounded shadow-sm" style={{ maxHeight: '400px' }} />
                                    <Button 
                                        variant="dark" 
                                        size="sm" 
                                        className="position-absolute top-0 end-0 m-2 opacity-75"
                                        onClick={() => { setImage(null); setPreview(null); }}
                                    >
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    className="border rounded p-5 d-flex flex-column align-items-center bg-light cursor-pointer"
                                    onClick={() => document.getElementById('post-image').click()}
                                    style={{ cursor: 'pointer', borderStyle: 'dashed !important' }}
                                >
                                    <AiOutlineCloudUpload size={50} className="text-muted mb-2" />
                                    <p className="mb-0 text-muted">Click to upload image</p>
                                </div>
                            )}
                            <Form.Control 
                                id="post-image"
                                type="file" 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                className="d-none"
                            />
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter a catchy title" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Caption</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                placeholder="Write a caption..." 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 fw-bold" 
                            disabled={loading}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : "Share Post"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreatePost;
