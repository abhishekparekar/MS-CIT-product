const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    studentId: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true
    },
    fatherName: {
      type: String,
      trim: true
    },
    motherName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    dob: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      district: String,
      state: { type: String, default: 'Maharashtra' },
      pincode: String
    },
    photo: {
      type: String,
      default: ''
    },
    // Academic Details
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    courseName: {
      type: String,
      default: 'MS-CIT'
    },
    batchTime: {
      type: String,
      default: '10:00 AM - 12:00 PM'
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Enrolled', 'Active', 'ExamCompleted', 'Passed', 'Completed', 'Dropped'],
      default: 'Enrolled',
      index: true
    },
    // Financial Details
    totalFee: {
      type: Number,
      default: 4500
    },
    paidFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending'
    },
    // Hall Ticket & Exam tracking
    hallTicketGenerated: {
      type: Boolean,
      default: false
    },
    hallTicketNumber: {
      type: String,
      trim: true
    },
    examDate: {
      type: Date
    },
    examCenter: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Virtual for remaining dues
studentSchema.virtual('dueFee').get(function () {
  return Math.max(0, (this.totalFee || 0) - (this.paidFee || 0) - (this.discount || 0));
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
