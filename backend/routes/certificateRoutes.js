const express = require('express');
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', protect, getCertificates);
router.post('/', protect, authorize('franchise', 'admin', 'superadmin'), createCertificate);
router.get('/verify/:certNumber', verifyCertificate);

module.exports = router;
