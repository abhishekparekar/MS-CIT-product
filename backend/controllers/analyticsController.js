const Tenant = require('../models/Tenant');
const Student = require('../models/Student');
const FeePayment = require('../models/FeePayment');
const Course = require('../models/Course');
const AffiliationApplication = require('../models/AffiliationApplication');
const ExamSubmission = require('../models/ExamSubmission');

// @desc    Get Super Admin SaaS Analytics
// @route   GET /api/analytics/admin
// @access  Private (Super Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments({ isActive: true });
    const pendingAffiliations = await AffiliationApplication.countDocuments({ status: 'Pending' });
    const totalStudents = await Student.countDocuments();
    const passedStudents = await Student.countDocuments({ status: 'Passed' });
    const totalCourses = await Course.countDocuments({ isActive: true });

    // Aggregate total revenue
    const payments = await FeePayment.find();
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Recent 5 applications
    const recentApplications = await AffiliationApplication.find().sort({ createdAt: -1 }).limit(5);

    // Top performing franchise centers
    const franchises = await Tenant.find({ isActive: true }).limit(10);
    const franchiseStats = await Promise.all(
      franchises.map(async (f) => {
        const studentCount = await Student.countDocuments({ tenant: f._id });
        return {
          franchiseId: f.franchiseId,
          centerName: f.centerName,
          place: f.address?.place || '',
          ownerName: f.ownerName,
          studentCount,
          status: f.subscription?.status || 'Active'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalTenants,
        pendingAffiliations,
        totalStudents,
        passedStudents,
        totalCourses,
        totalRevenue,
        recentApplications,
        franchiseStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Franchise Dashboard Analytics
// @route   GET /api/analytics/franchise
// @access  Private (Franchise Admin)
exports.getFranchiseAnalytics = async (req, res, next) => {
  try {
    if (!req.user.tenant) {
      return res.status(400).json({ success: false, message: 'No franchise associated with this user.' });
    }

    const tenantId = req.user.tenant._id;
    const totalStudents = await Student.countDocuments({ tenant: tenantId });
    const passedStudents = await Student.countDocuments({ tenant: tenantId, status: 'Passed' });
    const enrolledStudents = await Student.countDocuments({ tenant: tenantId, status: 'Enrolled' });

    // Revenue calculations
    const payments = await FeePayment.find({ tenant: tenantId });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Submissions
    const totalExamsTaken = await ExamSubmission.countDocuments({ tenant: tenantId });

    // Recent students
    const recentStudents = await Student.find({ tenant: tenantId }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        passedStudents,
        enrolledStudents,
        totalRevenue,
        totalExamsTaken,
        recentStudents
      }
    });
  } catch (error) {
    next(error);
  }
};
