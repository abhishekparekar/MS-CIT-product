const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    centerName: {
      type: String,
      required: [true, 'Center Name is required'],
      trim: true
    },
    firmName: {
      type: String,
      trim: true
    },
    ownerName: {
      type: String,
      required: [true, 'Owner Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    altContactNumber: {
      type: String,
      trim: true
    },
    address: {
      centerAddress: { type: String, trim: true },
      place: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, default: 'Maharashtra', trim: true },
      pincode: { type: String, trim: true }
    },
    infrastructure: {
      computerSystems: { type: Number, default: 10 },
      noOfClassroom: { type: Number, default: 2 },
      noOfLab: { type: Number, default: 1 },
      seatRequire: { type: Number, default: 50 },
      premisesArea: { type: Number, default: 500 }
    },
    trade: {
      type: String,
      default: 'MS-CIT',
      trim: true
    },
    affiliationFee: {
      type: Number,
      default: 25000
    },
    affiliationFeePaid: {
      type: Number,
      default: 0
    },
    // SaaS Subscription & Licensing Engine
    subscription: {
      plan: {
        type: String,
        enum: ['starter', 'professional', 'enterprise', 'custom'],
        default: 'professional'
      },
      status: {
        type: String,
        enum: ['Active', 'Pending', 'Suspended', 'Expired'],
        default: 'Active',
        index: true
      },
      startDate: { type: Date, default: Date.now },
      expiryDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
      },
      maxStudentsQuota: { type: Number, default: 500 },
      features: {
        onlineExams: { type: Boolean, default: true },
        automatedCertificates: { type: Boolean, default: true },
        receiptGeneration: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false }
      }
    },
    approvedDate: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tenant', tenantSchema);
