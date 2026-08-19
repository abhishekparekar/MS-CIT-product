const AffiliationApplication = require('../models/AffiliationApplication');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @desc    Submit new franchise affiliation request (Public)
// @route   POST /api/affiliations
// @access  Public
exports.submitApplication = async (req, res, next) => {
  try {
    const {
      directorName,
      email,
      contactNumber,
      whatsappNumber,
      qualification,
      instituteName,
      centerAddress,
      place,
      district,
      state,
      pincode,
      computerCount,
      classroomCount,
      labCount,
      totalArea,
      desiredUsername,
      desiredPassword
    } = req.body;

    const count = await AffiliationApplication.countDocuments();
    const applicationNumber = `APP-${new Date().getFullYear()}-${(101 + count).toString()}`;

    const application = await AffiliationApplication.create({
      applicationNumber,
      directorName,
      email: email.toLowerCase(),
      contactNumber,
      whatsappNumber,
      qualification,
      instituteName,
      centerAddress,
      place,
      district,
      state: state || 'Maharashtra',
      pincode,
      computerCount: Number(computerCount) || 10,
      classroomCount: Number(classroomCount) || 2,
      labCount: Number(labCount) || 1,
      totalArea: Number(totalArea) || 500,
      desiredUsername,
      desiredPassword,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Franchise affiliation application submitted successfully. Our team will review and contact you.',
      applicationNumber: application.applicationNumber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all affiliation applications (Admin)
// @route   GET /api/affiliations
// @access  Private (Super Admin)
exports.getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const applications = await AffiliationApplication.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve affiliation application & create Tenant & User
// @route   POST /api/affiliations/:id/approve
// @access  Private (Super Admin)
exports.approveApplication = async (req, res, next) => {
  try {
    const application = await AffiliationApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This application has already been approved.'
      });
    }

    // Generate unique Franchise ID
    const count = await Tenant.countDocuments();
    const franchiseId = `ITPL-${(101 + count).toString()}`;

    // Create the Tenant record
    const tenant = await Tenant.create({
      franchiseId,
      centerName: application.instituteName,
      firmName: application.instituteName,
      ownerName: application.directorName,
      email: application.email.toLowerCase(),
      contactNumber: application.contactNumber,
      altContactNumber: application.whatsappNumber,
      address: {
        centerAddress: application.centerAddress,
        place: application.place,
        district: application.district,
        state: application.state,
        pincode: application.pincode
      },
      infrastructure: {
        computerSystems: application.computerCount,
        noOfClassroom: application.classroomCount,
        noOfLab: application.labCount,
        premisesArea: application.totalArea,
        seatRequire: 50
      },
      approvedBy: req.user._id,
      approvedDate: Date.now()
    });

    // Create / Update Franchise Login User
    const username = application.desiredUsername || application.email.split('@')[0];
    const password = application.desiredPassword || 'franchise123';

    let user = await User.findOne({ email: application.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: application.directorName,
        email: application.email.toLowerCase(),
        username: username.toLowerCase(),
        password: password,
        role: 'franchise',
        phone: application.contactNumber,
        tenant: tenant._id
      });
    } else {
      user.tenant = tenant._id;
      user.role = 'franchise';
      await user.save();
    }

    // Update application status
    application.status = 'Approved';
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user._id;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Franchise application approved and tenant activated successfully.',
      tenant,
      franchiseUser: {
        email: user.email,
        username: user.username,
        franchiseId: tenant.franchiseId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject / Update application status
// @route   PUT /api/affiliations/:id/status
// @access  Private (Super Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    const application = await AffiliationApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminRemarks,
        reviewedAt: Date.now(),
        reviewedBy: req.user._id
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      application
    });
  } catch (error) {
    next(error);
  }
};
