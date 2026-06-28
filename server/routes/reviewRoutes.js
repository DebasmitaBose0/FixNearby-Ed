import express from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reportReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, createReview);

router.post('/:id/report', protect, reportReview);

router.get('/:id', getReviewById);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
