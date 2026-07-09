import express from 'express';
import {
  searchWorkers,
  getSearchSuggestions,
  getPopularSearches,
  searchWorkersNearby,
  getCategoryCounts,
} from '../controllers/searchController.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search workers with advanced filters
 * @access  Public
 */
router.get('/', searchWorkers);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions
 * @access  Public
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular searches
 * @access  Public
 */
router.get('/popular', getPopularSearches);

/**
 * @route   GET /api/search/nearby
 * @desc    Geospatial nearby worker search
 * @access  Public
 */
router.get('/nearby', searchWorkersNearby);

/**
 * @route   GET /api/search/categories
 * @desc    Get worker counts by category
 * @access  Public
 */
router.get('/categories', getCategoryCounts);

export default router;
