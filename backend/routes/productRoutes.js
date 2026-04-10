const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTopRatedProducts,
  getDealsProducts,
  getRelatedProducts,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/top-rated', getTopRatedProducts);
router.get('/deals', getDealsProducts);
router.get('/brands', getBrands);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById); // protect removed - recently viewed tracked only when logged in

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;