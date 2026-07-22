const mongoose = require('mongoose');

const loyaltyAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    pointsBalance: { type: Number, default: 0 },
    tier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], default: 'BRONZE' },
    referralCode: { type: String, unique: true },
    referredCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltyAccount', loyaltyAccountSchema);
