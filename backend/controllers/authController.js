const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Student = require('../models/Student');
const { generateToken } = require('../config/jwt');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, tenantId, studentRollNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    let tenantRef = null;
    let studentRef = null;

    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (tenant) tenantRef = tenant._id;
    }

    if (role === 'student' && studentRollNumber) {
      const student = await Student.findOne({ rollNumber: studentRollNumber });
      if (student) {
        studentRef = student._id;
        if (!tenantRef) tenantRef = student.tenant;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      username: email.split('@')[0],
      password,
      role: role || 'student',
      phone,
      tenant: tenantRef,
      studentRef: studentRef
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Super Admin, Franchise, Student)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password.'
      });
    }

    // Support login by email, username, or student roll number
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    }).select('+password').populate('tenant').populate('studentRef');

    // If not found as user, check if student roll number was entered
    if (!user) {
      const student = await Student.findOne({ rollNumber: email });
      if (student && student.email) {
        user = await User.findOne({ email: student.email.toLowerCase() })
          .select('+password')
          .populate('tenant')
          .populate('studentRef');
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check franchise status if user is franchise role
    if (user.role === 'franchise' && user.tenant) {
      if (user.tenant.subscription && user.tenant.subscription.status === 'Suspended') {
        return res.status(403).json({
          success: false,
          message: 'Franchise account is suspended. Please contact the administrator.'
        });
      }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
        student: user.studentRef
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('tenant')
      .populate({
        path: 'studentRef',
        populate: { path: 'course' }
      });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};
