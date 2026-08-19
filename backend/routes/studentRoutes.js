const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  issueHallTicket,
  deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentById);
router.post('/', protect, authorize('franchise', 'admin', 'superadmin'), createStudent);
router.put('/:id', protect, authorize('franchise', 'admin', 'superadmin'), updateStudent);
router.post('/:id/hall-ticket', protect, authorize('franchise', 'admin', 'superadmin'), issueHallTicket);
router.delete('/:id', protect, authorize('franchise', 'admin', 'superadmin'), deleteStudent);

module.exports = router;
