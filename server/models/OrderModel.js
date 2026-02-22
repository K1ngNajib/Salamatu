const mongoose = require('mongoose');

const acknowledgementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  acknowledgedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  issuingAuthority: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  recipients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }],
  priority: {
    type: String,
    enum: ['Routine', 'Important', 'Urgent'],
    default: 'Routine',
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Acknowledged', 'Archived'],
    default: 'Draft',
  },
  attachments: [{
    fileName: String,
    encryptedFileURL: String,
  }],
  signature: {
    type: String,
    required: true,
  },
  acknowledgements: [acknowledgementSchema],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
