import express from 'express';
const router = express.Router();
import { createDispute, getDisputes, getDisputeById, resolveDispute } from '../controllers/disputeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.post('/', protect, createDispute);
router.get('/', protect, adminOnly, getDisputes);
router.get('/:id', protect, getDisputeById);
router.patch('/:id/resolve', protect, adminOnly, resolveDispute);

export default router;
