import express from 'express';
import { updateGeofence, getWorkerGeofence } from '../controllers/geofenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update', protect, updateGeofence);
router.get('/:workerId', getWorkerGeofence);

export default router;
