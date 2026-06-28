import express from 'express';
import { registerWorker, loginWorker, getWorkers, getWorkerById, getWorkerProfile, getNearbyWorkers, recalculateKarmaScoresController, getWorkerAvailability, getWorkerReviews } from '../controllers/workerController.js';
import { protectWorker } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profilePicture'), registerWorker);
router.post('/login', loginWorker);
router.get('/profile', protectWorker, getWorkerProfile);
router.get('/nearby', validateNearbyWorkersQuery, cacheMiddleware(60), getNearbyWorkers);
router.post('/recalculate-karma', protectWorker, recalculateKarmaScoresController);
router.get('/', cacheMiddleware(120), getWorkers);
router.get('/:id', cacheMiddleware(60), getWorkerById);
router.get('/:id/availability', cacheMiddleware(30), getWorkerAvailability);
router.get('/:id/reviews', cacheMiddleware(120), getWorkerReviews);

export default router;
