import express from 'express';
import {
  getPayoutDetails,
  createConnectAccount,
  requestPayout
} from '../controllers/payoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/details', protect, getPayoutDetails);
router.post('/stripe-connect', protect, createConnectAccount);
router.post('/request', protect, requestPayout);

export default router;
