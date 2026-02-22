const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['command-announcement', 'unit-room', 'department-channel', 'direct-secure', 'admin-broadcast'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  pinnedMessages: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
