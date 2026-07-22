const LoyaltyAccount = require('../models/LoyaltyAccount');
const Coupon = require('../models/Coupon');

exports.getLoyaltyProfile = async (req, res) => {
  try {
    let account = await LoyaltyAccount.findOne({ userId: req.user._id || req.user.id });
    if (!account) {
      account = await LoyaltyAccount.create({
        userId: req.user._id || req.user.id,
        referralCode: 'FIX-' + Math.random().toString(36).substring(2, 7).toUpperCase()
      });
    }
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
