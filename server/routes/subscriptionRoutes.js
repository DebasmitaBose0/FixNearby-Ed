import express from 'express';
import { getActiveSubscription, upgradeSubscription, getSubscriptionAnalytics } from '../controllers/subscriptionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSubscription);
router.post('/upgrade', upgradeSubscription);
router.get('/analytics', adminOnly, getSubscriptionAnalytics);
import * as subController from '../controllers/subscriptionController.js';
import { validateSubscriptionPayload } from '../middleware/subscriptionValidationMiddleware.js';

const router = express.Router();

router.post('/', validateSubscriptionPayload, subController.createSubscription);
router.get('/customer/:customerId', subController.getCustomerSubscriptions);
router.patch('/:subscriptionId/status', subController.toggleStatus);

export default router;
