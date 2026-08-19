const express = require('express');
const router = express.Router();
const {
  getTenants,
  getMyFranchise,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
} = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Logged in franchise profile
router.get('/me', protect, authorize('franchise', 'admin', 'superadmin'), getMyFranchise);

// Admin routes
router.get('/', protect, authorize('superadmin', 'admin'), getTenants);
router.post('/', protect, authorize('superadmin', 'admin'), createTenant);
router.get('/:id', protect, getTenantById);
router.put('/:id', protect, authorize('superadmin', 'admin', 'franchise'), updateTenant);
router.delete('/:id', protect, authorize('superadmin'), deleteTenant);

module.exports = router;
