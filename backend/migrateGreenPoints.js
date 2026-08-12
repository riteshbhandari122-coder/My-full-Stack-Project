// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Atlas Shell Migration Command
// ─────────────────────────────────────────────────────────────────────────────
// Run this in MongoDB Atlas Shell (mongosh) to backfill all pre-existing users
// with 100 welcome bonus green points and the default 6 monthly challenges.
//
// HOW TO RUN:
//   1. Open MongoDB Atlas → Database → Connect → MongoDB Shell (mongosh)
//   2. Paste the command below and press Enter
//   3. It will update ALL users that don't have greenPoints or monthlyChallenges
// ─────────────────────────────────────────────────────────────────────────────

db.users.updateMany(
  {
    $or: [
      { greenPoints: { $exists: false } },
      { greenPoints: null },
      { greenPoints: 0 },
      { monthlyChallenges: { $exists: false } },
      { monthlyChallenges: { $size: 0 } },
    ],
  },
  {
    $set: {
      greenPoints: 100, // 100 Welcome/Sign-up Bonus
      monthlyChallenges: [
        { challengeKey: 'BUY_ECO', title: 'Buy 3 eco-friendly products this month', points: 150, currentCount: 0, targetCount: 3, isCompleted: false },
        { challengeKey: 'RETURN_PACKAGE', title: 'Return 5 packages for recycling', points: 250, currentCount: 0, targetCount: 5, isCompleted: false },
        { challengeKey: 'REUSABLE_BAG', title: 'Use a reusable shopping bag', points: 100, currentCount: 0, targetCount: 1, isCompleted: false },
        { challengeKey: 'REFER_FRIEND', title: 'Refer 2 friends to ShopMart', points: 200, currentCount: 0, targetCount: 2, isCompleted: false },
        { challengeKey: 'LOCAL_SELLER', title: 'Buy from 2 local sellers', points: 120, currentCount: 0, targetCount: 2, isCompleted: false },
        { challengeKey: 'REVIEW_ECO', title: 'Review 3 eco-friendly products', points: 180, currentCount: 0, targetCount: 3, isCompleted: false },
      ],
    },
  }
);

// ─── Verify the migration ────────────────────────────────────────────────────
// Run this to see how many users were updated:
// db.users.countDocuments({ greenPoints: 100 })

// ─── Optional: Check users that still need updating ──────────────────────────
// db.users.find({
//   $or: [
//     { greenPoints: { $exists: false } },
//     { monthlyChallenges: { $exists: false } },
//   ]
// }).count()