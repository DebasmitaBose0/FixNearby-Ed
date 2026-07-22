const PricingEngine = require('../utils/pricingEngine');
const PricingSurgeRule = require('../models/PricingSurgeRule');

exports.getQuote = async (req, res) => {
  try {
    const { baseRate, category, distanceKm } = req.query;
    const rule = await PricingSurgeRule.findOne({ category, isActive: true });
    const multiplier = rule ? rule.surgeMultiplier : 1.0;
    
    const quote = PricingEngine.calculateQuote(
      Number(baseRate) || 50,
      multiplier,
      Number(distanceKm) || 0,
      true
    );

    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
