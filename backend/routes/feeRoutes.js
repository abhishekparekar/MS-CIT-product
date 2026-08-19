const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getReceipt
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', protect, getPayments);
router.post('/pay', protect, authorize('franchise', 'admin', 'superadmin'), recordPayment);
router.get('/receipt/:receiptNumber', protect, getReceipt);

module.exports = router;
