const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel'); // <-- ADDED User model import
const Invitation = require('../models/invitationModel');

// --- POST /api/projects --- (Create a new project)
router.post('/', protect, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Project name is required' });
    }
    try {
        const project = new Project({
            name,
            owner: req.user._id,
            members: [req.user._id]
        });
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- GET /api/projects --- (Get all projects for the logged-in user)
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user._id }).populate('owner', 'username').populate('members', 'username');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- GET /api/projects/:id --- (Get a single project's details)
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'username')
            .populate('members', 'username');
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.members.some(member => member._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'User not authorized for this project' });
        }
        
        const tasks = await Task.find({ project: req.params.id }).populate('createdBy', 'username');
        const messages = await Message.find({ project: req.params.id }).populate('sender', 'username');

        res.json({ project, tasks, messages });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- NEW ROUTE ---
// --- POST /api/projects/:id/members --- (Add a member to a project)
router.post('/:id/members', protect, async (req, res) => {
    const { email } = req.body;
    const projectId = req.params.id;

    try {
        // Find the user to add by their email
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User with that email not found.' });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Check if the requesting user is the project owner
        if (project.owner.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Only the project owner can add members.' });
        }

        // Check if the user is already a member
        if (project.members.includes(userToAdd._id)) {
            return res.status(400).json({ message: 'User is already a member of this project.' });
        }

        // Add the user's ID to the project's members array
        project.members.push(userToAdd._id);
        await project.save();

        // Also add the project's ID to the user's projects array
        userToAdd.projects.push(project._id);
        await userToAdd.save();

        // Respond with the fully populated, updated project
        const updatedProject = await Project.findById(projectId)
            .populate('owner', 'username')
            .populate('members', 'username');

        res.json(updatedProject);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/:id/invitations', protect, async (req, res) => {
    const { email } = req.body;
    const projectId = req.params.id;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        if (project.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only the project owner can send invitations.' });

        const recipient = await User.findOne({ email });
        if (!recipient) return res.status(404).json({ message: 'User with that email not found.' });
        if (project.members.includes(recipient._id)) return res.status(400).json({ message: 'User is already a member.' });
        
        const existingInvite = await Invitation.findOne({ project: projectId, recipientEmail: email, status: 'pending' });
        if (existingInvite) return res.status(400).json({ message: 'An invitation has already been sent to this user.' });

        const invitation = new Invitation({ project: projectId, sender: req.user._id, recipientEmail: email });
        await invitation.save();
        res.status(201).json({ message: 'Invitation sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner', 'username').populate('members', 'username');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.members.some(member => member._id.equals(req.user._id))) return res.status(403).json({ message: 'Not authorized' });
        
        const tasks = await Task.find({ project: req.params.id }).populate('createdBy', 'username');
        const messages = await Message.find({ project: req.params.id }).populate('sender', 'username');
        const links = await Link.find({ project: req.params.id }).populate('createdBy', 'username'); // <-- NEW

        res.json({ project, tasks, messages, links }); // <-- NEW

    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// --- NEW: Delete a chat message ---
router.delete('/messages/:messageId', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId).populate('project');
        if (!message) return res.status(404).json({ message: 'Message not found' });
        
        // Check if user is the sender OR the project owner
        const isSender = message.sender.toString() === req.user._id.toString();
        const isOwner = message.project.owner.toString() === req.user._id.toString();

        if (!isSender && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        // Deletion is handled by the socket event after this authorization check
        res.status(200).json({ message: 'Message deletion authorized' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/links/:linkId', protect, async (req, res) => {
    try {
        const link = await Link.findById(req.params.linkId).populate('project');
        if (!link) return res.status(404).json({ message: 'Link not found' });

        const isCreator = link.createdBy.toString() === req.user._id.toString();
        const isOwner = link.project.owner.toString() === req.user._id.toString();

        if (!isCreator && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this link' });
        }
        res.status(200).json({ message: 'Link deletion authorized' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
