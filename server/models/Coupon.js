const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, default: 0 },
    flatDiscountAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    currentUses: { type: Number, default: 0 },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
