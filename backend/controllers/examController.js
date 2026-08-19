const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const Student = require('../models/Student');

// @desc    Get all active exams
// @route   GET /api/exams
// @access  Public / Authenticated
exports.getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ isActive: true }).select('-questions.correctOption');
    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam with questions
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = async (req, res, next) => {
  try {
    let exam;
    // If superadmin or franchise, include correct options for preview/editing
    if (req.user && ['superadmin', 'admin', 'franchise'].includes(req.user.role)) {
      exam = await Exam.findById(req.params.id);
    } else {
      // For students, hide the correct answers
      exam = await Exam.findById(req.params.id).select('-questions.correctOption');
    }

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    res.status(200).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Super Admin, Franchise Admin)
exports.createExam = async (req, res, next) => {
  try {
    const { title, courseId, courseName, durationMinutes, totalMarks, passingMarks, questions } = req.body;

    const count = await Exam.countDocuments();
    const examCode = `EXAM-${(101 + count).toString()}`;

    const exam = await Exam.create({
      examCode,
      title,
      course: courseId,
      courseName: courseName || 'MS-CIT',
      durationMinutes: durationMinutes || 60,
      totalMarks: totalMarks || 50,
      passingMarks: passingMarks || 20,
      questions: questions || []
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit online exam answers and auto-grade
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
exports.submitExam = async (req, res, next) => {
  try {
    const { answers, rollNumber } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    // Find student
    let student = null;
    if (req.user && req.user.studentRef) {
      student = await Student.findById(req.user.studentRef);
    } else if (rollNumber) {
      student = await Student.findOne({ rollNumber });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found for this exam submission.'
      });
    }

    // Auto-grade answers
    let score = 0;
    const gradedAnswers = [];

    exam.questions.forEach((q) => {
      const submitted = answers.find(a => a.questionId.toString() === q._id.toString());
      const selected = submitted ? submitted.selectedOption : null;
      const isCorrect = selected === q.correctOption;
      const marksAwarded = isCorrect ? (q.marks || 2) : 0;

      if (isCorrect) score += marksAwarded;

      gradedAnswers.push({
        questionId: q._id,
        selectedOption: selected,
        isCorrect,
        marksAwarded
      });
    });

    const totalMarks = exam.totalMarks || 50;
    const percentage = Number(((score / totalMarks) * 100).toFixed(1));
    const isPassed = score >= (exam.passingMarks || 20);

    let grade = 'F';
    if (percentage >= 85) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 55) grade = 'B';
    else if (percentage >= 40) grade = 'C';

    const submission = await ExamSubmission.create({
      exam: exam._id,
      student: student._id,
      tenant: student.tenant,
      rollNumber: student.rollNumber,
      studentName: student.name,
      answers: gradedAnswers,
      score,
      totalMarks,
      percentage,
      grade,
      status: isPassed ? 'Pass' : 'Fail'
    });

    // Update student status
    student.status = isPassed ? 'Passed' : 'ExamCompleted';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Exam submitted and graded successfully.',
      result: {
        submissionId: submission._id,
        score,
        totalMarks,
        percentage,
        grade,
        status: submission.status,
        studentName: student.name,
        rollNumber: student.rollNumber,
        examTitle: exam.title
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam submissions / results (Franchise & Admin)
// @route   GET /api/exams/submissions
// @access  Private
exports.getSubmissions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'franchise' && req.user.tenant) {
      query.tenant = req.user.tenant._id;
    } else if (req.user.role === 'student' && req.user.studentRef) {
      query.student = req.user.studentRef;
    }

    const submissions = await ExamSubmission.find(query)
      .populate('exam', 'title examCode')
      .populate('student', 'name rollNumber courseName')
      .populate('tenant', 'centerName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
};
