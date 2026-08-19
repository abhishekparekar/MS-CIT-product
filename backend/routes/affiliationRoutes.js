const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplications,
  approveApplication,
  updateApplicationStatus
} = require('../controllers/affiliationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/', submitApplication);
router.get('/', protect, authorize('superadmin', 'admin'), getApplications);
router.post('/:id/approve', protect, authorize('superadmin', 'admin'), approveApplication);
router.put('/:id/status', protect, authorize('superadmin', 'admin'), updateApplicationStatus);

module.exports = router;
