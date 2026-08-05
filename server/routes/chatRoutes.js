import express from 'express';
import { getChatHistory, markAsRead, getUnreadCount } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Get paginated chat history between current user and partnerId
router.get('/history/:partnerId', protect, getChatHistory);

// Get total and per-sender unread message counts
router.get('/unread-count', protect, getUnreadCount);

// Mark all unread messages from a specific partner as read
router.patch('/read/:partnerId', protect, markAsRead);

export default router;
