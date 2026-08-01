import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAdminStats,
  getAdminUsers,
  getAdminWorkers,
  banUser,
  getUserBookings
} from '../controllers/adminController.js';

const router = express.Router();

// Require both authentication and admin role authorization
router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/workers', getAdminWorkers);
router.put('/users/:id/ban', banUser);
router.get('/users/:id/bookings', getUserBookings);

export default router;
