import express from 'express';
import {
  searchWorkers,
  getSearchSuggestions,
  getPopularSearches,
} from '../controllers/searchController.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search workers with advanced filters
 * @access  Public
 */
router.get('/', cacheMiddleware(120, { warmup: true }), searchWorkers);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions
 * @access  Public
 */
router.get('/suggestions', cacheMiddleware(300), getSearchSuggestions);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular searches
 * @access  Public
 */
router.get('/popular', cacheMiddleware(600), getPopularSearches);

export default router;
