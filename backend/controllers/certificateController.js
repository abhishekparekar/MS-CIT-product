const Marksheet = require('../models/Marksheet');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const Tenant = require('../models/Tenant');

// @desc    Generate Marksheet for Student
// @route   POST /api/marksheets
// @access  Private (Franchise Admin, Super Admin)
exports.createMarksheet = async (req, res, next) => {
  try {
    const { studentId, rollNumber, subjectMarks } = req.body;

    let student;
    if (studentId) {
      student = await Student.findById(studentId).populate('tenant');
    } else if (rollNumber) {
      student = await Student.findOne({ rollNumber }).populate('tenant');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Calculate marks total
    const subjects = subjectMarks || [
      { subjectName: 'Computer Fundamentals & Windows', maxMarks: 25, obtainedMarks: 23 },
      { subjectName: 'MS Word & MS Excel', maxMarks: 25, obtainedMarks: 24 },
      { subjectName: 'MS PowerPoint & Access', maxMarks: 25, obtainedMarks: 22 },
      { subjectName: 'Internet & Cyber Security', maxMarks: 25, obtainedMarks: 24 }
    ];

    const totalMax = subjects.reduce((sum, s) => sum + (s.maxMarks || 25), 0);
    const totalObtained = subjects.reduce((sum, s) => sum + (s.obtainedMarks || 0), 0);
    const percentage = Number(((totalObtained / totalMax) * 100).toFixed(1));

    let grade = 'F';
    if (percentage >= 85) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 55) grade = 'B';
    else if (percentage >= 40) grade = 'C';

    const count = await Marksheet.countDocuments();
    const marksheetNumber = `MS-${new Date().getFullYear()}-${(1001 + count).toString()}`;

    const marksheet = await Marksheet.create({
      marksheetNumber,
      student: student._id,
      tenant: student.tenant._id,
      rollNumber: student.rollNumber,
      studentName: student.name,
      courseName: student.courseName || 'MS-CIT',
      centerName: student.tenant.centerName,
      subjectMarks: subjects,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage,
      grade,
      result: percentage >= 40 ? 'PASS' : 'FAIL'
    });

    res.status(201).json({
      success: true,
      message: 'Marksheet generated successfully.',
      marksheet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Certificate for Student
// @route   POST /api/certificates
// @access  Private (Franchise Admin, Super Admin)
exports.createCertificate = async (req, res, next) => {
  try {
    const { studentId, rollNumber, grade } = req.body;

    let student;
    if (studentId) {
      student = await Student.findById(studentId).populate('tenant');
    } else if (rollNumber) {
      student = await Student.findOne({ rollNumber }).populate('tenant');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const count = await Certificate.countDocuments();
    const certificateNumber = `ITPL-CERT-${new Date().getFullYear()}-${(1001 + count).toString()}`;
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${certificateNumber}`;

    const certificate = await Certificate.create({
      certificateNumber,
      student: student._id,
      tenant: student.tenant._id,
      rollNumber: student.rollNumber,
      studentName: student.name,
      courseName: student.courseName || 'MS-CIT',
      duration: '3 Months',
      grade: grade || 'A+',
      centerName: student.tenant.centerName,
      verificationUrl
    });

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully.',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Marksheets
// @route   GET /api/marksheets
// @access  Private
exports.getMarksheets = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'franchise' && req.user.tenant) {
      query.tenant = req.user.tenant._id;
    } else if (req.user.role === 'student' && req.user.studentRef) {
      query.student = req.user.studentRef;
    }

    const marksheets = await Marksheet.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: marksheets.length,
      marksheets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Certificates
// @route   GET /api/certificates
// @access  Private
exports.getCertificates = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'franchise' && req.user.tenant) {
      query.tenant = req.user.tenant._id;
    } else if (req.user.role === 'student' && req.user.studentRef) {
      query.student = req.user.studentRef;
    }

    const certificates = await Certificate.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public Verification of Certificate / Marksheet
// @route   GET /api/certificates/verify/:certNumber
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const certNumber = req.params.certNumber.toUpperCase();
    const certificate = await Certificate.findOne({ certificateNumber: certNumber })
      .populate('tenant', 'centerName district state');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found or invalid certificate number.'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        rollNumber: certificate.rollNumber,
        courseName: certificate.courseName,
        grade: certificate.grade,
        issueDate: certificate.issueDate,
        centerName: certificate.centerName,
        status: certificate.status
      }
    });
  } catch (error) {
    next(error);
  }
};
