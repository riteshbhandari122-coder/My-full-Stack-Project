const asyncHandler = require('express-async-handler');
const RecyclingRecord = require('../models/RecyclingRecord');
const User = require('../models/User');

// ─── Point values per item type ───────────────────────────────────────────────
const ITEM_POINTS = {
  plastic_bottles: 5,
  plastic_bags: 3,
  cardboard: 5,
  glass: 8,
  aluminum: 5,
  ewaste: 50,
  reusable_containers: 10,
  paper: 2,
};

const ITEM_NAMES = {
  plastic_bottles: 'Plastic bottles',
  plastic_bags: 'Plastic bags',
  cardboard: 'Cardboard boxes',
  glass: 'Glass bottles',
  aluminum: 'Aluminum cans',
  ewaste: 'E-Waste',
  reusable_containers: 'Reusable containers',
  paper: 'Paper',
};

// @desc    Submit recycling drop-off
// @route   POST /api/recycling
// @access  Private (user must be logged in)
const submitRecycling = asyncHandler(async (req, res) => {
  const { items, dropOffLocation, note } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Please provide at least one recycled item');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Validate items & calculate points
  const validatedItems = [];
  let totalPoints = 0;

  for (const item of items) {
    const { itemType, quantity } = item;
    if (!ITEM_POINTS[itemType]) {
      res.status(400);
      throw new Error(`Invalid item type: ${itemType}`);
    }
    if (!quantity || quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    const pointsPerItem = ITEM_POINTS[itemType];
    const itemTotal = pointsPerItem * quantity;
    totalPoints += itemTotal;

    validatedItems.push({
      itemType,
      itemName: ITEM_NAMES[itemType],
      quantity,
      pointsPerItem,
      totalPoints: itemTotal,
    });
  }

  // Create the recycling record
  const record = await RecyclingRecord.create({
    user: user._id,
    userName: user.name,
    userEmail: user.email,
    items: validatedItems,
    totalPointsAwarded: totalPoints,
    dropOffLocation: dropOffLocation || '',
    note: note || '',
    status: 'received',
  });

  // 🌱 Award green points to the user
  user.greenPoints = (user.greenPoints || 0) + totalPoints;

  // 📦 Update the 'RETURN_PACKAGE' monthly challenge
  if (user.monthlyChallenges && Array.isArray(user.monthlyChallenges)) {
    const totalItems = validatedItems.reduce((sum, i) => sum + i.quantity, 0);
    const challenge = user.monthlyChallenges.find(
      (c) => c.challengeKey === 'RETURN_PACKAGE'
    );
    if (challenge && !challenge.isCompleted) {
      challenge.currentCount = (challenge.currentCount || 0) + totalItems;
      if (challenge.currentCount >= challenge.targetCount) {
        challenge.isCompleted = true;
        user.greenPoints = (user.greenPoints || 0) + challenge.points;
      }
    }
  }

  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: `Recycling recorded! You earned ${totalPoints} green points. 🌱`,
    record,
    greenPoints: user.greenPoints,
    monthlyChallenges: user.monthlyChallenges,
  });
});

// @desc    Get user's recycling history
// @route   GET /api/recycling/my
// @access  Private
const getMyRecycling = asyncHandler(async (req, res) => {
  const records = await RecyclingRecord.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  // Calculate total items recycled by user
  const totalItems = records.reduce((sum, r) =>
    sum + r.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalPoints = records.reduce((sum, r) => sum + r.totalPointsAwarded, 0);

  res.json({
    success: true,
    records,
    totalItems,
    totalPoints,
  });
});

// @desc    Get all recycling records (community + admin)
// @route   GET /api/recycling
// @access  Public (community stats) / Private (admin)
const getAllRecycling = asyncHandler(async (req, res) => {
  // Community stats — visible to everyone
  const stats = await RecyclingRecord.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: { $sum: '$items.quantity' } },
        totalPointsAwarded: { $sum: '$totalPointsAwarded' },
        totalRecords: { $sum: 1 },
      },
    },
  ]);

  // Recent records — public feed (limit 20)
  const recentRecords = await RecyclingRecord.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .select('userName items totalPointsAwarded createdAt');

  // Admin — full records list
  let allRecords = [];
  if (req.user && req.user.role === 'admin') {
    allRecords = await RecyclingRecord.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
  }

  res.json({
    success: true,
    stats: stats[0] || { totalItems: 0, totalPointsAwarded: 0, totalRecords: 0 },
    recentRecords,
    allRecords,
  });
});

// @desc    Update recycling record status (admin)
// @route   PUT /api/recycling/:id
// @access  Private (admin only)
const updateRecyclingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['received', 'processed', 'recycled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const record = await RecyclingRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Recycling record not found');
  }

  record.status = status;
  await record.save();

  res.json({ success: true, record });
});

module.exports = {
  submitRecycling,
  getMyRecycling,
  getAllRecycling,
  updateRecyclingStatus,
};