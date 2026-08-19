const Gallery = require('../models/Gallery');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
exports.getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;

    const items = await Gallery.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / add gallery item
// @route   POST /api/gallery
// @access  Private (Super Admin)
exports.addGalleryItem = async (req, res, next) => {
  try {
    const { title, category, imageUrl, description } = req.body;

    const item = await Gallery.create({
      title,
      category: category || 'Events',
      imageUrl,
      description,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Gallery item added successfully.',
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private (Super Admin)
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
