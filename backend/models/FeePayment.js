const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
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
    amount: {
      type: Number,
      required: true
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'],
      default: 'Cash'
    },
    transactionId: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FeePayment', feePaymentSchema);
