const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['superadmin', 'admin', 'franchise', 'student'],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipientRole: {
      type: String,
      enum: ['superadmin', 'admin', 'franchise', 'student', 'all_franchises', 'all_students'],
      default: 'superadmin'
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
