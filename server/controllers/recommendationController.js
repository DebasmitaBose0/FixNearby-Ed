import { getSmartRecommendations } from '../services/recommendationService.js';
import jwt from 'jsonwebtoken';

/**
 * Helper to optionally extract user ID from Bearer token without rejecting unauthenticated guests
 */
const extractUserIdFromReq = (req) => {
  if (req.user?._id) return req.user._id.toString();

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded?.id) return decoded.id.toString();
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  return null;
};

// @desc    Get AI-powered personalized recommendations
// @route   GET /api/recommendations
// @access  Public / Optional Auth
export const getRecommendationsHandler = async (req, res) => {
  try {
    const userId = extractUserIdFromReq(req);
    const { lat, lng, limit } = req.query;

    const result = await getSmartRecommendations({
      userId,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      limit: limit ? Number(limit) : 12,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while computing recommendations',
      error: error.message,
    });
  }
};
