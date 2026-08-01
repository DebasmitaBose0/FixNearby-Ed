import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getPaymentById,
  requestRefund,
  releaseEscrowFunds,
  getEscrowStatus,
  linkStripeConnectAccount
} from '../controllers/paymentController.js';

const router = express.Router();

// Stripe Webhook (Public, signature-verified)
router.post('/webhook', handleStripeWebhook);

// Protected routes (require user authentication)
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentById);
router.post('/:id/refund', requestRefund);

// Escrow & Stripe Connect Multi-Party Routing Routes
router.post('/escrow/:bookingId/release', releaseEscrowFunds);
router.get('/escrow/status/:bookingId', getEscrowStatus);
router.post('/escrow/connect-account', linkStripeConnectAccount);

export default router;

