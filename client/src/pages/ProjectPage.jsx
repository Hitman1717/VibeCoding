import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import TodoList from '../components/project/TodoList';
import ChatWindow from '../components/project/ChatWindow';
import AddMemberModal from '../components/project/AddMemberModal';
import ImportantLinks from '../components/project/ImportantLinks'; // <-- NEW
import { Row, Col, Spinner, Alert, Card, Button, ListGroup, Badge } from 'react-bootstrap';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [links, setLinks] = useState([]); // <-- NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data } = await api.get(`/api/projects/${projectId}`);
        setProject(data.project);
        setTasks(data.tasks);
        setMessages(data.messages);
        setLinks(data.links); // <-- NEW
      } catch (err) { setError('Failed to load project data.'); } 
      finally { setLoading(false); }
    };
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (socket) {
      socket.emit('project:join', projectId);
      // Task listeners
      socket.on('task:new_task', (newTask) => setTasks((prev) => [...prev, newTask]));
      socket.on('task:updated', (updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t)));
      socket.on('task:deleted', (deletedTaskId) => setTasks(prev => prev.filter(t => t._id !== deletedTaskId)));
      // Chat listeners
      socket.on('chat:new_message', (newMessage) => setMessages((prev) => [...prev, newMessage]));
      socket.on('chat:deleted_message', (deletedMessageId) => setMessages(prev => prev.filter(m => m._id !== deletedMessageId)));
      // Link listeners <-- NEW
      socket.on('link:new_link', (newLink) => setLinks((prev) => [...prev, newLink]));
      socket.on('link:deleted_link', (deletedLinkId) => setLinks(prev => prev.filter(l => l._id !== deletedLinkId)));

      return () => {
        socket.off('task:new_task');
        socket.off('task:updated');
        socket.off('task:deleted');
        socket.off('chat:new_message');
        socket.off('chat:deleted_message');
        socket.off('link:new_link');
        socket.off('link:deleted_link');
      };
    }
  }, [socket, projectId]);

  const handleSendInvitation = async (email) => {
    setInviteStatus({ error: '', success: '' });
    try {
        const { data } = await api.post(`/api/projects/${projectId}/invitations`, { email });
        setInviteStatus({ success: data.message, error: '' });
        setShowInviteModal(false);
    } catch (err) {
        setInviteStatus({ error: err.response?.data?.message || 'Failed to send invitation.', success: '' });
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!project) return null;

  const isOwner = user._id === project.owner._id;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">{project.name}</h1>
            <p className="text-muted mb-0">Owned by: {project.owner.username}</p>
          </div>
          {isOwner && (
            <Button variant="outline-primary" onClick={() => setShowInviteModal(true)}>
              + Invite Member
            </Button>
          )}
      </div>
      
      {inviteStatus.success && <Alert variant="success" onClose={() => setInviteStatus({success: ''})} dismissible>{inviteStatus.success}</Alert>}

      <Row>
        <Col lg={8}>
            <Row>
                <Col md={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">To-Do List</Card.Header>
                        <Card.Body><TodoList initialTasks={tasks} projectId={projectId} /></Card.Body>
                    </Card>
                </Col>
                <Col md={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Team Chat</Card.Header>
                        <Card.Body><ChatWindow initialMessages={messages} projectId={projectId} isOwner={isOwner} /></Card.Body>
                    </Card>
                </Col>
            </Row>
        </Col>
        <Col lg={4}>
            <div className="mb-4">
                <Card>
                    <Card.Header as="h5">Team Members</Card.Header>
                    <ListGroup variant="flush">
                        {project.members.map(member => (
                            <ListGroup.Item key={member._id}>
                                {member.username} {member._id === project.owner._id && <Badge bg="info" className="ms-2">Owner</Badge>}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            </div>
            <div className="mb-4"> {/* <-- NEW SECTION --> */}
                <Card>
                    <Card.Header as="h5">Important Links</Card.Header>
                    <Card.Body>
                        <ImportantLinks initialLinks={links} projectId={projectId} isOwner={isOwner} />
                    </Card.Body>
                </Card>
            </div>
        </Col>
      </Row>

      <AddMemberModal
        show={showInviteModal}
        onHide={() => {
            setShowInviteModal(false);
            setInviteStatus({ error: '', success: '' });
        }}
        onSendInvitation={handleSendInvitation}
        error={inviteStatus.error}
      />
    </>
  );
};

export default ProjectPage;