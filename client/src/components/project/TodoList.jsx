import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, InputGroup, ListGroup, CloseButton } from 'react-bootstrap';

const TodoList = ({ initialTasks, projectId }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskContent, setNewTaskContent] = useState('');
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskContent.trim() || !socket) return;
    socket.emit('task:create', { projectId, content: newTaskContent, createdBy: user._id });
    setNewTaskContent('');
  };

  const handleToggleComplete = (task) => {
    if (!socket) return;
    socket.emit('task:update', { taskId: task._id, updates: { isCompleted: !task.isCompleted } });
  };

  const handleDeleteTask = (taskId) => {
    if (!socket) return;
    socket.emit('task:delete', { taskId, projectId });
  };

  return (
    <>
      <Form onSubmit={handleCreateTask}>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Add a new task..."
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
          />
          <Button variant="outline-primary" type="submit">Add</Button>
        </InputGroup>
      </Form>

      <ListGroup>
        {tasks.map(task => (
          <ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-center">
            <div>
              <Form.Check 
                type="checkbox"
                id={`task-${task._id}`}
                checked={task.isCompleted}
                onChange={() => handleToggleComplete(task)}
                label={
                  <span className={task.isCompleted ? 'text-decoration-line-through text-muted' : ''}>
                    {task.content} <small className="text-muted">({task.createdBy.username})</small>
                  </span>
                }
              />
            </div>
            <CloseButton onClick={() => handleDeleteTask(task._id)} />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

export default TodoList;