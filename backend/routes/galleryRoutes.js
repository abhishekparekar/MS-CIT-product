const express = require('express');
const router = express.Router();
const { getGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getGallery);
router.post('/', protect, authorize('superadmin', 'admin'), addGalleryItem);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteGalleryItem);

module.exports = router;
