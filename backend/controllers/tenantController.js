const Tenant = require('../models/Tenant');
const Student = require('../models/Student');
const User = require('../models/User');
const FeePayment = require('../models/FeePayment');

// @desc    Get all franchise centers (Super Admin)
// @route   GET /api/tenants /api/franchises
// @access  Private (Super Admin)
exports.getTenants = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query['subscription.status'] = status;
    }

    if (search) {
      query.$or = [
        { centerName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { franchiseId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const tenants = await Tenant.find(query).sort({ createdAt: -1 });

    // Attach student counts for each tenant
    const tenantsWithCounts = await Promise.all(
      tenants.map(async (t) => {
        const studentCount = await Student.countDocuments({ tenant: t._id });
        const passedCount = await Student.countDocuments({ tenant: t._id, status: 'Passed' });
        return {
          ...t.toObject(),
          totalStudents: studentCount,
          passedStudents: passedCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: tenantsWithCounts.length,
      tenants: tenantsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current franchise profile (for logged in Franchise)
// @route   GET /api/franchises/me
// @access  Private (Franchise Admin)
exports.getMyFranchise = async (req, res, next) => {
  try {
    if (!req.user.tenant) {
      return res.status(404).json({
        success: false,
        message: 'No franchise associated with this account.'
      });
    }

    const tenant = await Tenant.findById(req.user.tenant._id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Franchise center not found.'
      });
    }

    // Aggregate franchise dashboard stats
    const totalStudents = await Student.countDocuments({ tenant: tenant._id });
    const passedStudents = await Student.countDocuments({ tenant: tenant._id, status: 'Passed' });
    const enrolledStudents = await Student.countDocuments({ tenant: tenant._id, status: 'Enrolled' });

    const payments = await FeePayment.find({ tenant: tenant._id });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      franchise: {
        ...tenant.toObject(),
        stats: {
          totalStudents,
          passedStudents,
          enrolledStudents,
          totalRevenue
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single franchise center by ID
// @route   GET /api/tenants/:id
// @access  Private (Super Admin / Franchise Owner)
exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Franchise center not found.'
      });
    }

    const studentCount = await Student.countDocuments({ tenant: tenant._id });

    res.status(200).json({
      success: true,
      tenant: {
        ...tenant.toObject(),
        totalStudents: studentCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new franchise center
// @route   POST /api/tenants
// @access  Private (Super Admin)
exports.createTenant = async (req, res, next) => {
  try {
    const {
      centerName,
      firmName,
      ownerName,
      email,
      contactNumber,
      address,
      infrastructure,
      trade,
      affiliationFee,
      desiredUsername,
      desiredPassword
    } = req.body;

    // Generate unique Franchise ID e.g. ITPL-101
    const count = await Tenant.countDocuments();
    const franchiseId = `ITPL-${(101 + count).toString()}`;

    const tenant = await Tenant.create({
      franchiseId,
      centerName,
      firmName,
      ownerName,
      email: email.toLowerCase(),
      contactNumber,
      address,
      infrastructure,
      trade: trade || 'MS-CIT',
      affiliationFee: affiliationFee || 25000,
      approvedBy: req.user._id
    });

    // Create default franchise admin user
    const username = desiredUsername || email.split('@')[0];
    const password = desiredPassword || 'franchise123';

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: ownerName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: password,
        role: 'franchise',
        phone: contactNumber,
        tenant: tenant._id
      });
    } else {
      user.tenant = tenant._id;
      user.role = 'franchise';
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Franchise center created and activated successfully.',
      tenant,
      userCredentials: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update franchise center
// @route   PUT /api/tenants/:id
// @access  Private (Super Admin / Franchise Owner)
exports.updateTenant = async (req, res, next) => {
  try {
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Franchise center not found.'
      });
    }

    // If not superadmin, verify user owns this franchise
    if (req.user.role !== 'superadmin' && req.user.tenant?.toString() !== tenant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this franchise.'
      });
    }

    tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Franchise details updated successfully.',
      tenant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Deactivate franchise center
// @route   DELETE /api/tenants/:id
// @access  Private (Super Admin)
exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Franchise center not found.'
      });
    }

    tenant.isActive = false;
    tenant.subscription.status = 'Suspended';
    await tenant.save();

    res.status(200).json({
      success: true,
      message: 'Franchise deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
