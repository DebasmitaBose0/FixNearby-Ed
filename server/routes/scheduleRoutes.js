import express from 'express';
import {
  getWorkerSchedule,
  getWorkerScheduleById,
  setRecurringAvailability,
  blockTimeSlot,
  getBlockedSlots,
  removeBlockedSlot,
} from '../controllers/scheduleController.js';
import { protectWorker } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Customer-facing worker schedule lookup
router.get('/worker/:id', getWorkerScheduleById);

// Worker-protected management routes
router.get('/', protectWorker, getWorkerSchedule);
router.post('/set-recurring', protectWorker, setRecurringAvailability);
router.post('/recurring', protectWorker, setRecurringAvailability);
router.post('/block', protectWorker, blockTimeSlot);
router.get('/blocked', protectWorker, getBlockedSlots);
router.delete('/block/:id', protectWorker, removeBlockedSlot);

export default router;
