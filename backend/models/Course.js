const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Course Title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Foundation', 'Professional', 'Advanced', 'Vocational', 'Diploma'],
      default: 'Foundation'
    },
    duration: {
      type: String,
      default: '3 Months'
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner'
    },
    fee: {
      type: Number,
      required: true,
      default: 4500
    },
    description: {
      type: String,
      trim: true
    },
    syllabus: [
      {
        moduleNumber: Number,
        moduleTitle: String,
        topics: [String]
      }
    ],
    eligibility: {
      type: String,
      default: '10th / 12th Pass or equivalent'
    },
    isPopular: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model('Course', courseSchema);
