const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [
    {
      optionKey: { type: String, required: true }, // 'A', 'B', 'C', 'D'
      text: { type: String, required: true }
    }
  ],
  correctOption: {
    type: String,
    required: true // 'A', 'B', 'C', 'D'
  },
  marks: {
    type: Number,
    default: 2
  },
  category: {
    type: String,
    default: 'MS-CIT Fundamentals'
  }
});

const examSchema = new mongoose.Schema(
  {
    examCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Exam Title is required'],
      trim: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    courseName: {
      type: String,
      default: 'MS-CIT'
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    totalMarks: {
      type: Number,
      default: 50
    },
    passingMarks: {
      type: Number,
      default: 20
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Exam', examSchema);
