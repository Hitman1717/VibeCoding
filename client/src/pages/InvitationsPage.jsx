import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';

const InvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/invitations');
            setInvitations(data);
        } catch (err) {
            setError('Failed to fetch invitations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleResponse = async (invitationId, action) => {
        try {
            await api.post(`/api/invitations/${invitationId}/${action}`);
            // Refresh the list after responding
            fetchInvitations();
        } catch (err) {
            setError(`Failed to ${action} invitation.`);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Card>
            <Card.Header as="h3">Your Project Invitations</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {invitations.length > 0 ? (
                    <ListGroup>
                        {invitations.map(invite => (
                            <ListGroup.Item key={invite._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    You have been invited to join <strong>{invite.project.name}</strong> by <strong>{invite.sender.username}</strong>.
                                </div>
                                <div>
                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleResponse(invite._id, 'accept')}>
                                        Accept
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleResponse(invite._id, 'decline')}>
                                        Decline
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p>You have no pending invitations.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default InvitationsPage;
