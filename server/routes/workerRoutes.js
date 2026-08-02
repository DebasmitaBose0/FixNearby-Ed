// Worker route schema validations enabled
import express from 'express';
import {
  registerWorker,
  loginWorker,
  getWorkers,
  getWorkerById,
  getWorkerProfile,
  getNearbyWorkers,
  recalculateKarmaScoresController,
  getWorkerAvailability,
  getWorkerReviews,
  getWorkerDashboardStats,
  getWorkersBatch,
  getWorkersByBounds,
  getWorkerClusters,
  updateWorkerProfile,
  updateAvailableNowStatus,
} from '../controllers/workerController.js';
import { protectWorker } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateGeoCoordinates } from '../middleware/geoValidator.js';
import {
  addService,
  updateService,
  removeService,
  getMyServices,
  updateHourlyRate,
  getWorkerServices,
} from '../controllers/workerController.js';

const router = express.Router();

router.post('/batch', getWorkersBatch);
router.post('/register', upload.single('profilePicture'), validateGeoCoordinates, registerWorker);
router.post('/login', loginWorker);
router.get('/profile', protectWorker, getWorkerProfile);
router.patch('/profile/available-now', protectWorker, updateAvailableNowStatus);
router.put('/profile', protectWorker, updateWorkerProfile);
router.get('/nearby', getNearbyWorkers);
router.get('/map-bounds', getWorkersByBounds);
router.get('/clusters', getWorkerClusters);
router.get('/dashboard/stats', protectWorker, getWorkerDashboardStats);
router.post('/recalculate-karma', protectWorker, recalculateKarmaScoresController);

// Service catalog management (protected - worker only)
router.get('/services', protectWorker, getMyServices);
router.post('/services', protectWorker, addService);
router.put('/services/:serviceId', protectWorker, updateService);
router.delete('/services/:serviceId', protectWorker, removeService);
router.put('/hourly-rate', protectWorker, updateHourlyRate);

// Public routes
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.get('/:id/availability', getWorkerAvailability);
router.get('/:id/reviews', getWorkerReviews);
router.get('/:id/services', getWorkerServices);

export default router;
