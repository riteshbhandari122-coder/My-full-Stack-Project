const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadImage, uploadImages } = require('../controllers/uploadController');

router.post('/image', protect, upload.single('image'), uploadImage);
router.post('/images', protect, upload.array('images', 10), uploadImages);

module.exports = router;
