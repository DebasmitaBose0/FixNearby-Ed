import express from 'express';
import { getRecommendationsHandler } from '../controllers/recommendationController.js';

const router = express.Router();

// GET /api/recommendations
router.get('/', getRecommendationsHandler);

export default router;
