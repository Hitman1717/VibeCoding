import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const AddMemberModal = ({ show, onHide, onSendInvitation, error }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendInvitation(email);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Invite a Team Member</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="memberEmail">
                        <Form.Label>User's Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3 w-100">
                        Send Invitation
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddMemberModal;