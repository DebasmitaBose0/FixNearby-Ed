import express from 'express';
import {
  getReportedReviews,
  approveReview,
  rejectReview,
  bulkAction,
  getModerationStats
} from '../controllers/moderationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All moderation routes require admin authentication & authorization
router.use(protect);
router.use(adminOnly);

router.get('/reviews', getReportedReviews);
router.patch('/reviews/:id/approve', approveReview);
router.patch('/reviews/:id/reject', rejectReview);
router.post('/reviews/bulk', bulkAction);
router.get('/stats', getModerationStats);

export default router;
