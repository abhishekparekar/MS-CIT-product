const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, authorize('superadmin', 'admin'), createCourse);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('superadmin'), deleteCourse);

module.exports = router;
