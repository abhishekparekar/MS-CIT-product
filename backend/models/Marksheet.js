const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema(
  {
    marksheetNumber: {
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
    centerName: {
      type: String,
      required: true
    },
    subjectMarks: [
      {
        subjectName: String,
        maxMarks: Number,
        obtainedMarks: Number
      }
    ],
    totalMaxMarks: {
      type: Number,
      default: 100
    },
    totalObtainedMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      default: 'A+'
    },
    result: {
      type: String,
      enum: ['PASS', 'FAIL'],
      default: 'PASS'
    },
    issueDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Marksheet', marksheetSchema);
