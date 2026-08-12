const asyncHandler = require('express-async-handler');
const path = require('path');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
  });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload files');
  }

  const urls = req.files.map((file) => ({
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    filename: file.filename,
  }));

  res.json({ success: true, images: urls });
});

module.exports = { uploadImage, uploadImages };
