import express from 'express';
import { getChatHistory, markMessagesAsRead } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Get paginated chat history between current user and partnerId
router.get('/history/:partnerId', protect, getChatHistory);

// Mark incoming unread messages as read
router.patch('/read/:partnerId', protect, markMessagesAsRead);

export default router;
