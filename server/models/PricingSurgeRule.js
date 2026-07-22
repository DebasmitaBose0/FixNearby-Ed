const mongoose = require('mongoose');

const pricingSurgeRuleSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    surgeMultiplier: { type: Number, default: 1.0 },
    isActive: { type: Boolean, default: true },
    peakHoursStart: { type: String, default: '17:00' },
    peakHoursEnd: { type: String, default: '21:00' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingSurgeRule', pricingSurgeRuleSchema);
