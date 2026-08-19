const Student = require('../models/Student');
const Tenant = require('../models/Tenant');
const Course = require('../models/Course');
const User = require('../models/User');

// Helper to generate unique Roll Number
const generateRollNumber = async (tenantCode = 'ITPL') => {
  const currentYear = new Date().getFullYear();
  const count = await Student.countDocuments();
  const sequence = (count + 1).toString().padStart(4, '0');
  return `MSCIT-${currentYear}-${sequence}`;
};

// @desc    Get all students (tenant-isolated for franchise, global for admin)
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const { status, courseId, search, tenantId } = req.query;
    let query = {};

    // Apply tenant filter
    if (req.user.role === 'franchise') {
      if (!req.user.tenant) {
        return res.status(400).json({ success: false, message: 'No franchise associated with this account.' });
      }
      query.tenant = req.user.tenant._id;
    } else if (tenantId && req.user.role === 'superadmin') {
      query.tenant = tenantId;
    }

    if (status) query.status = status;
    if (courseId) query.course = courseId;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('course')
      .populate('tenant', 'centerName franchiseId place')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('course')
      .populate('tenant');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Tenant check for franchise users
    if (req.user.role === 'franchise' && student.tenant._id.toString() !== req.user.tenant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view student from another franchise.'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll a new student
// @route   POST /api/students
// @access  Private (Franchise Admin, Super Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const {
      name,
      fatherName,
      motherName,
      email,
      contactNumber,
      gender,
      dob,
      address,
      courseId,
      courseName,
      batchTime,
      totalFee,
      paidFee,
      discount,
      tenantId
    } = req.body;

    let targetTenantId = req.user.tenant ? req.user.tenant._id : tenantId;

    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        message: 'Franchise Center (Tenant) ID is required.'
      });
    }

    // Verify course exists or get default
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      course = await Course.findOne({ isActive: true });
    }

    // Generate unique roll number
    const rollNumber = await generateRollNumber();

    // Determine payment status
    const feeAmount = totalFee || (course ? course.fee : 4500);
    const paid = Number(paidFee) || 0;
    const disc = Number(discount) || 0;
    const due = feeAmount - paid - disc;

    let paymentStatus = 'Pending';
    if (due <= 0) paymentStatus = 'Paid';
    else if (paid > 0) paymentStatus = 'Partial';

    const student = await Student.create({
      tenant: targetTenantId,
      rollNumber,
      studentId: rollNumber,
      name,
      fatherName,
      motherName,
      email,
      contactNumber,
      gender,
      dob,
      address,
      course: course._id,
      courseName: courseName || course.title,
      batchTime: batchTime || '10:00 AM - 12:00 PM',
      totalFee: feeAmount,
      paidFee: paid,
      discount: disc,
      paymentStatus,
      status: 'Enrolled'
    });

    // Create a student login account
    if (email) {
      let existingUser = await User.findOne({ email: email.toLowerCase() });
      if (!existingUser) {
        await User.create({
          name,
          email: email.toLowerCase(),
          username: rollNumber.toLowerCase(),
          password: contactNumber || 'student123',
          role: 'student',
          tenant: targetTenantId,
          studentRef: student._id,
          phone: contactNumber
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully.',
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Franchise authorization check
    if (req.user.role === 'franchise' && student.tenant.toString() !== req.user.tenant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this student.'
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue Hall Ticket for Student
// @route   POST /api/students/:id/hall-ticket
// @access  Private (Franchise Admin, Super Admin)
exports.issueHallTicket = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('tenant');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const { examDate, examCenter } = req.body;

    student.hallTicketGenerated = true;
    student.hallTicketNumber = `HT-${student.rollNumber}`;
    student.examDate = examDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    student.examCenter = examCenter || student.tenant.centerName;

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Hall ticket generated successfully.',
      hallTicket: {
        hallTicketNumber: student.hallTicketNumber,
        rollNumber: student.rollNumber,
        studentName: student.name,
        courseName: student.courseName,
        examDate: student.examDate,
        examCenter: student.examCenter
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private (Super Admin, Franchise Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
