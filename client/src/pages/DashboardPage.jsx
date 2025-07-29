import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/api/projects');
        setProjects(data);
      } catch (err) {
        setError('Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const { data } = await api.post('/api/projects', { name: newProjectName });
      setProjects([...projects, data]);
      setNewProjectName('');
    } catch (err) {
      setError('Failed to create project.');
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h1 className="mb-4">Your Projects</h1>
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleCreateProject}>
            <Row>
              <Col md={9}>
                <Form.Control
                  type="text"
                  placeholder="New Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Button type="submit" className="w-100">Create Project</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row>
        {projects.length > 0 ? projects.map(project => (
          <Col key={project._id} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{project.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Owner: {project.owner.username}</Card.Subtitle>
                <Card.Text>Members: {project.members.length}</Card.Text>
                <Link to={`/project/${project._id}`}>
                  <Button variant="primary">Open Project</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )) : <p>You have no projects. Create one to get started!</p>}
      </Row>
    </>
  );
};

export default DashboardPage;