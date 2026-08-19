const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    rollNumber: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      default: 'MS-CIT'
    },
    duration: {
      type: String,
      default: '3 Months'
    },
    grade: {
      type: String,
      default: 'A+'
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    centerName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Issued', 'Verified', 'Revoked'],
      default: 'Issued'
    },
    verificationUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
