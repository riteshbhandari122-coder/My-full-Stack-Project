const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { parent, featured } = req.query;

  let query = { isActive: true };
  if (parent === 'null' || parent === 'root') query.parent = null;
  else if (parent) query.parent = parent;
  if (featured) query.featured = true;

  const categories = await Category.find(query)
    .populate('children')
    .sort('order name');

  res.json({ success: true, categories });
});

// @desc    Get category by id or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
  }).populate('children').populate('parent', 'name slug');

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, category });
});

// @desc    Get category tree (nested)
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order name');

  const buildTree = (parentId = null) => {
    return categories
      .filter((c) => String(c.parent) === String(parentId))
      .map((c) => ({ ...c.toObject(), children: buildTree(c._id) }));
  };

  const tree = buildTree(null);
  res.json({ success: true, categories: tree });
});

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, category });
});

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productCount} products. Reassign products first.`);
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
});

module.exports = { getCategories, getCategoryById, getCategoryTree, createCategory, updateCategory, deleteCategory };
