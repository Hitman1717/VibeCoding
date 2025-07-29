import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Form, Button, InputGroup, Card, CloseButton } from 'react-bootstrap';

const ChatWindow = ({ initialMessages, projectId, isOwner }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    socket.emit('chat:message', { projectId, content: newMessage, senderId: user._id });
    setNewMessage('');
  };

  const handleDeleteMessage = async (messageId) => {
      try {
        await api.delete(`/api/projects/messages/${messageId}`);
        socket.emit('chat:delete', { messageId, projectId });
      } catch (error) {
          alert("You are not authorized to delete this message.");
      }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '500px' }}>
      <div className="flex-grow-1 overflow-auto p-3 bg-body-tertiary rounded mb-3">
        {messages.map((msg) => {
          const isSender = msg.sender._id === user._id;
          const canDelete = isSender || isOwner;

          return (
            <div key={msg._id} className={`d-flex align-items-end mb-2 ${isSender ? 'justify-content-end' : 'justify-content-start'}`}>
                
                {!isSender && canDelete && <CloseButton className="me-2 mb-1" onClick={() => handleDeleteMessage(msg._id)} />}

                <Card bg={isSender ? 'primary' : 'secondary'} text="white" style={{ maxWidth: '75%' }}>
                    <Card.Body className="p-2">
                        <Card.Subtitle className="mb-1" style={{ fontSize: '0.75rem' }}>
                            {msg.sender.username}
                        </Card.Subtitle>
                        <Card.Text>{msg.content}</Card.Text>
                    </Card.Body>
                </Card>

                {isSender && canDelete && <CloseButton className="ms-2 mb-1" onClick={() => handleDeleteMessage(msg._id)} />}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <Form onSubmit={handleSendMessage}>
        <InputGroup>
          <Form.Control
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="primary" type="submit">Send</Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default ChatWindow;