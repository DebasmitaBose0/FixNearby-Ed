const express = require('express');
const router = express.Router();
const { getLoyaltyProfile, validateCoupon } = require('../controllers/rewardsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getLoyaltyProfile);
router.post('/validate-coupon', protect, validateCoupon);

module.exports = router;
