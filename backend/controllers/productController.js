const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, keyword, category, brand, minPrice, maxPrice, ratings, sort, page, limit } = req.query;

  let query = { isActive: true };

  // Search
  const searchTerm = keyword || search;
  if (searchTerm) {
    // ✅ Find matching categories first
    const matchingCats = await Category.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).select('_id');
    const catIds = matchingCats.map(c => c._id);

    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
      ...(catIds.length > 0 ? [{ category: { $in: catIds } }] : []),
    ];
  }

  // Category filter
  if (category) query.category = category;

  // Brand filter
  if (brand) {
    const brands = brand.split(',');
    query.brand = { $in: brands };
  }

  // Price range
  if (minPrice || maxPrice) {
    query.discountedPrice = {};
    if (minPrice) query.discountedPrice.$gte = Number(minPrice);
    if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
  }

  // Ratings filter
  if (ratings) query.ratings = { $gte: Number(ratings) };

  // Sort options
  let sortOption = '-createdAt';
  if (sort === 'price-asc') sortOption = 'discountedPrice';
  else if (sort === 'price-desc') sortOption = '-discountedPrice';
  else if (sort === 'rating') sortOption = '-ratings';
  else if (sort === 'popular') sortOption = '-sold';
  else if (sort === 'newest') sortOption = '-createdAt';

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
  })
    .populate('category', 'name slug')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: { product: product._id } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        recentlyViewed: {
          $each: [{ product: product._id, viewedAt: new Date() }],
          $position: 0,
          $slice: 20,
        },
      },
    });
  }

  res.json({ success: true, product });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(12)
    .sort('-createdAt');
  res.json({ success: true, products });
});

// @desc    Get top-rated products
// @route   GET /api/products/top-rated
// @access  Public
const getTopRatedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, numReviews: { $gt: 0 } })
    .populate('category', 'name slug')
    .sort('-ratings -numReviews')
    .limit(8);
  res.json({ success: true, products });
});

// @desc    Get deals/discounted products
// @route   GET /api/products/deals
// @access  Public
const getDealsProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, discountPercentage: { $gte: 20 } })
    .populate('category', 'name slug')
    .sort('-discountPercentage')
    .limit(20);
  res.json({ success: true, products });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(8)
    .sort('-ratings');

  res.json({ success: true, products: related });
});

// @desc    Search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

  // ✅ Find matching categories
  const matchingCategories = await Category.find({
    name: { $regex: q, $options: 'i' },
  }).select('_id name slug');

  const categoryIds = matchingCategories.map(c => c._id);

  // ✅ Search products by name, brand, tags OR category
  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
    ],
  })
    .select('name brand category images slug')
    .populate('category', 'name')
    .limit(8);

  const productSuggestions = products.map((p) => ({
    _id: p._id,
    name: p.name,
    brand: p.brand,
    category: p.category?.name,
    image: p.images[0]?.url,
    slug: p.slug,
    isCategory: false,
  }));

  // ✅ Category suggestions at top
  const categorySuggestions = matchingCategories.map(c => ({
    _id: c._id,
    name: c.name,
    isCategory: true,
    category: 'Category',
    image: null,
    slug: c.slug,
  }));

  res.json({
    success: true,
    suggestions: [...categorySuggestions, ...productSuggestions].slice(0, 10),
  });
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  req.body.seller = req.user._id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json({ success: true, product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Get brands list
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  res.json({ success: true, brands: brands.sort() });
});

module.exports = {
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
};