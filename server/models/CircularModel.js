const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    fileName: String,
    encryptedFileURL: String,
  }],
  publishedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  archiveStatus: {
    type: Boolean,
    default: false,
  },
  signature: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Circular', circularSchema);
