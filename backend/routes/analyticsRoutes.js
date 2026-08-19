const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getFranchiseAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/admin', protect, authorize('superadmin', 'admin'), getAdminAnalytics);
router.get('/franchise', protect, authorize('franchise', 'admin', 'superadmin'), getFranchiseAnalytics);

module.exports = router;
