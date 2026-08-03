import express from 'express';
import { getActiveSubscription, upgradeSubscription, getSubscriptionAnalytics } from '../controllers/subscriptionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSubscription);
router.post('/upgrade', upgradeSubscription);
router.get('/analytics', adminOnly, getSubscriptionAnalytics);

export default router;
