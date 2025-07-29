const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Invitation = require('../models/invitationModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Get all pending invitations for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const invitations = await Invitation.find({ recipientEmail: req.user.email, status: 'pending' })
            .populate('project', 'name')
            .populate('sender', 'username');
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Accept an invitation
router.post('/:id/accept', protect, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation || invitation.recipientEmail !== req.user.email) {
            return res.status(404).json({ message: 'Invitation not found or you are not the recipient.' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been responded to.' });
        }

        // Add user to project members
        const project = await Project.findById(invitation.project);
        project.members.push(req.user._id);
        await project.save();

        // Add project to user's projects
        const user = await User.findById(req.user._id);
        user.projects.push(invitation.project);
        await user.save();

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        res.json({ message: 'Invitation accepted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Decline an invitation
router.post('/:id/decline', protect, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation || invitation.recipientEmail !== req.user.email) {
            return res.status(404).json({ message: 'Invitation not found or you are not the recipient.' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been responded to.' });
        }

        invitation.status = 'declined';
        await invitation.save();

        res.json({ message: 'Invitation declined.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;