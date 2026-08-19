const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  submitExam,
  getSubmissions
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getExams);
router.get('/submissions', protect, getSubmissions);
router.get('/:id', protect, getExamById);
router.post('/', protect, authorize('superadmin', 'admin', 'franchise'), createExam);
router.post('/:id/submit', protect, submitExam);

module.exports = router;
