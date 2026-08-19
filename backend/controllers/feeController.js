const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');
const Tenant = require('../models/Tenant');

// @desc    Record a new fee payment and generate receipt
// @route   POST /api/fees/pay
// @access  Private (Franchise Admin, Super Admin)
exports.recordPayment = async (req, res, next) => {
  try {
    const { studentId, rollNumber, amount, paymentMode, transactionId, remarks } = req.body;

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

    const payAmount = Number(amount) || 0;
    if (payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero.'
      });
    }

    // Update student payment status
    student.paidFee = (student.paidFee || 0) + payAmount;
    const due = Math.max(0, (student.totalFee || 0) - student.paidFee - (student.discount || 0));

    if (due <= 0) student.paymentStatus = 'Paid';
    else student.paymentStatus = 'Partial';

    await student.save();

    // Create receipt
    const count = await FeePayment.countDocuments();
    const receiptNumber = `REC-${new Date().getFullYear()}-${(1001 + count).toString()}`;

    const payment = await FeePayment.create({
      receiptNumber,
      student: student._id,
      tenant: student.tenant._id,
      rollNumber: student.rollNumber,
      studentName: student.name,
      amount: payAmount,
      paymentMode: paymentMode || 'Cash',
      transactionId,
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'Fee payment recorded successfully.',
      payment,
      studentPaymentSummary: {
        totalFee: student.totalFee,
        paidFee: student.paidFee,
        dueFee: due,
        paymentStatus: student.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fee payments / receipts
// @route   GET /api/fees
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'franchise' && req.user.tenant) {
      query.tenant = req.user.tenant._id;
    } else if (req.user.role === 'student' && req.user.studentRef) {
      query.student = req.user.studentRef;
    }

    const payments = await FeePayment.find(query)
      .populate('tenant', 'centerName franchiseId')
      .populate('student', 'name rollNumber courseName')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student fee receipts
// @route   GET /api/fees/receipt/:receiptNumber
// @access  Private
exports.getReceipt = async (req, res, next) => {
  try {
    const payment = await FeePayment.findOne({ receiptNumber: req.params.receiptNumber.toUpperCase() })
      .populate('tenant')
      .populate('student');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.'
      });
    }

    res.status(200).json({
      success: true,
      receipt: payment
    });
  } catch (error) {
    next(error);
  }
};
