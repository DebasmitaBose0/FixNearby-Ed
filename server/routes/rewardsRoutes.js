import express from 'express';
import { getUserRewards, redeemCoupon } from '../controllers/rewardsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-rewards', protect, getUserRewards);
router.post('/redeem', protect, redeemCoupon);

export default router;
