const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Routine', 'Important', 'Urgent'],
    default: 'Important',
  },
  recipients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }],
  acknowledgementRequired: {
    type: Boolean,
    default: false,
  },
  acknowledgements: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Signal', signalSchema);
