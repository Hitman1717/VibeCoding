const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Link', linkSchema);