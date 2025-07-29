const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    recipientEmail: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);