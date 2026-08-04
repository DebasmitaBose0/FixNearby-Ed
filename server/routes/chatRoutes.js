import express from 'express';
import { getChatHistory, getConversations, markMessagesAsRead } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Get active conversation summaries with partner verification badges
router.get('/conversations', protect, getConversations);

// Get paginated chat history between current user and partnerId
router.get('/history/:partnerId', protect, getChatHistory);

// Mark incoming unread messages as read
router.patch('/read/:partnerId', protect, markMessagesAsRead);

export default router;
