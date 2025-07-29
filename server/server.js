const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- Model Imports ---
const Message = require('./models/messageModel');
const Task = require('./models/taskModel');
const Link = require('./models/linkModel'); 

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const invitationRoutes = require('./routes/invitationRoutes'); // <-- NEW

// --- App & Server Initialization ---
const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes); // <-- NEW

// --- Socket.IO Setup & Event Handling ---
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('project:join', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project room: ${projectId}`);
  });

  // --- Chat Message Handling ---
  socket.on('chat:message', async ({ projectId, content, senderId }) => {
    try {
      const newMessage = new Message({ content, project: projectId, sender: senderId });
      await newMessage.save();
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');
      io.to(projectId).emit('chat:new_message', populatedMessage);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', 'Failed to send message.');
    }
  });

  // --- NEW: Chat Deletion Handling ---
  socket.on('chat:delete', async ({ messageId, projectId }) => {
      try {
          // The authorization logic is handled via the REST API before this event is emitted.
          // Here we just delete and notify clients.
          await Message.findByIdAndDelete(messageId);
          io.to(projectId).emit('chat:deleted_message', messageId);
      } catch (error) {
          console.error('Error deleting chat message:', error);
          socket.emit('error', 'Failed to delete message.');
      }
  });


  // --- Task Handling ---
  socket.on('task:create', async ({ projectId, content, createdBy }) => {
    try {
        const newTask = new Task({ content, project: projectId, createdBy });
        await newTask.save();
        const populatedTask = await Task.findById(newTask._id).populate('createdBy', 'username');
        io.to(projectId).emit('task:new_task', populatedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        socket.emit('error', 'Failed to create task.');
    }
  });

  socket.on('task:update', async ({ taskId, updates }) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true }).populate('createdBy', 'username');
        if (updatedTask) {
            io.to(updatedTask.project.toString()).emit('task:updated', updatedTask);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        socket.emit('error', 'Failed to update task.');
    }
  });

  socket.on('task:delete', async ({ taskId, projectId }) => {
    try {
        await Task.findByIdAndDelete(taskId);
        io.to(projectId).emit('task:deleted', taskId);
    } catch (error) {
        console.error('Error deleting task:', error);
        socket.emit('error', 'Failed to delete task.');
    }
  });


  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});


// --- Server Listening ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
