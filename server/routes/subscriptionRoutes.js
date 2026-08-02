import express from 'express';
import * as subController from '../controllers/subscriptionController.js';
import { validateSubscriptionPayload } from '../middleware/subscriptionValidationMiddleware.js';

const router = express.Router();

router.post('/', validateSubscriptionPayload, subController.createSubscription);
router.get('/customer/:customerId', subController.getCustomerSubscriptions);
router.patch('/:subscriptionId/status', subController.toggleStatus);

export default router;
