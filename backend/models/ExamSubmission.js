const mongoose = require('mongoose');

const examSubmissionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
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
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        isCorrect: Boolean,
        marksAwarded: Number
      }
    ],
    score: {
      type: Number,
      required: true,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 50
    },
    percentage: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      default: 'A'
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    submitTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ExamSubmission', examSubmissionSchema);
