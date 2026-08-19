const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Events', 'Classroom', 'Convocation', 'Workshops', 'Awards', 'General'],
      default: 'Events'
    },
    imageUrl: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
