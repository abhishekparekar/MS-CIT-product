const mongoose = require('mongoose');

const affiliationApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true
    },
    // Director / Owner Details
    directorName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    whatsappNumber: {
      type: String,
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    // Center & Infrastructure Info
    instituteName: {
      type: String,
      required: true,
      trim: true
    },
    centerAddress: {
      type: String,
      required: true,
      trim: true
    },
    place: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      default: 'Maharashtra'
    },
    pincode: {
      type: String,
      required: true
    },
    computerCount: {
      type: Number,
      default: 10
    },
    classroomCount: {
      type: Number,
      default: 2
    },
    labCount: {
      type: Number,
      default: 1
    },
    totalArea: {
      type: Number,
      default: 500
    },
    // Proposed login credentials for approval
    desiredUsername: {
      type: String,
      trim: true
    },
    desiredPassword: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'UnderReview', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    adminRemarks: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AffiliationApplication', affiliationApplicationSchema);
