const express = require('express');
const router = express.Router();
const {
  getMarksheets,
  createMarksheet
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', protect, getMarksheets);
router.post('/', protect, authorize('franchise', 'admin', 'superadmin'), createMarksheet);

module.exports = router;
