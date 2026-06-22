const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  encryptedFileURL: {
    type: String,
    required: true,
  },
  accessPermissions: [{
    type: String,
    required: true,
  }],
  version: {
    type: Number,
    default: 1,
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  downloadTracking: [{
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    downloadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
