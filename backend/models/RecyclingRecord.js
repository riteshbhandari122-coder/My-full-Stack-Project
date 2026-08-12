const mongoose = require('mongoose');

// ─── Recycling Record Schema ──────────────────────────────────────────────────
// Stores every recycling drop-off made by users.
// When a user returns recyclable items, a record is created here,
// and the user is awarded Green Points based on the item type & quantity.
const recyclingRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true }, // 👤 snapshot of user's name
    userEmail: { type: String, required: true }, // 📧 snapshot of user's email
    items: [
      {
        itemType: {
          type: String,
          enum: [
            'plastic_bottles',
            'plastic_bags',
            'cardboard',
            'glass',
            'aluminum',
            'ewaste',
            'reusable_containers',
            'paper',
          ],
          required: true,
        },
        itemName: { type: String, required: true }, // e.g. 'Plastic bottles'
        quantity: { type: Number, required: true, min: 1 },
        pointsPerItem: { type: Number, required: true },
        totalPoints: { type: Number, required: true },
      },
    ],
    totalPointsAwarded: { type: Number, required: true }, // 🌱 green points given
    dropOffLocation: { type: String, default: '' },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['received', 'processed', 'recycled'],
      default: 'received',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecyclingRecord', recyclingRecordSchema);