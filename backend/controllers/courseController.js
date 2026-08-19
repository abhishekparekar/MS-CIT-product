const Course = require('../models/Course');

// @desc    Get all courses (Public)
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { category, level, isPopular } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (isPopular) query.isPopular = isPopular === 'true';

    const courses = await Course.find(query).sort({ isPopular: -1, title: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID or code
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res, next) => {
  try {
    let course = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(req.params.id);
    } else {
      course = await Course.findOne({ courseCode: req.params.id.toUpperCase() });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Super Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Super Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Super Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
