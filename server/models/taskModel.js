const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;