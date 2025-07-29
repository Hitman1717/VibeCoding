import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Form, Button, InputGroup, ListGroup, CloseButton, Alert } from 'react-bootstrap';

const ImportantLinks = ({ initialLinks, projectId, isOwner }) => {
    const [links, setLinks] = useState(initialLinks || []);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [error, setError] = useState('');
    const socket = useSocket();
    const { user } = useAuth();

    useEffect(() => { setLinks(initialLinks || []); }, [initialLinks]);

    const handleAddLink = (e) => {
        e.preventDefault();
        setError('');
        if (!newLinkTitle.trim() || !newLinkUrl.trim() || !socket) return;
        
        try {
            new URL(newLinkUrl);
        } catch (_) {
            setError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        socket.emit('link:create', { 
            projectId, 
            title: newLinkTitle,
            url: newLinkUrl,
            createdBy: user._id 
        });
        setNewLinkTitle('');
        setNewLinkUrl('');
    };

    const handleDeleteLink = async (linkId) => {
        try {
            await api.delete(`/api/projects/links/${linkId}`);
            socket.emit('link:delete', { linkId, projectId });
        } catch (err) {
            alert("You are not authorized to delete this link.");
        }
    };

    return (
        <>
            <Form onSubmit={handleAddLink}>
                {error && <Alert variant="danger" size="sm">{error}</Alert>}
                <InputGroup size="sm" className="mb-2">
                    <InputGroup.Text>Title</InputGroup.Text>
                    <Form.Control placeholder="e.g., Project Docs" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} />
                </InputGroup>
                <InputGroup size="sm" className="mb-2">
                    <InputGroup.Text>URL</InputGroup.Text>
                    <Form.Control placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} />
                </InputGroup>
                <Button variant="outline-primary" size="sm" type="submit" className="w-100">Add Link</Button>
            </Form>

            <hr />

            <ListGroup variant="flush">
                {links && links.length > 0 ? links.map(link => {
                    const canDelete = user._id === link.createdBy._id || isOwner;
                    return (
                        <ListGroup.Item key={link._id} className="d-flex justify-content-between align-items-center px-0">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-truncate">
                                {link.title}
                            </a>
                            {canDelete && <CloseButton onClick={() => handleDeleteLink(link._id)} />}
                        </ListGroup.Item>
                    );
                }) : <p className="text-muted text-center small mt-2">No links shared yet.</p>}
            </ListGroup>
        </>
    );
};

export default ImportantLinks;