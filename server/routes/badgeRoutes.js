import express from 'express';
import {
  getPendingBadgeRequests,
  submitBadgeRequest,
  reviewBadgeRequest
} from '../controllers/badgeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', protect, getPendingBadgeRequests);
router.post('/request', protect, submitBadgeRequest);
router.put('/review/:requestId', protect, reviewBadgeRequest);

export default router;
