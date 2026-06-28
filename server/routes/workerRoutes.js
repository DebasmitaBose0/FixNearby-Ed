import express from 'express';
import { registerWorker, loginWorker, getWorkers, getWorkerById, getWorkerProfile, getNearbyWorkers, recalculateKarmaScoresController, getWorkerAvailability, getWorkerReviews } from '../controllers/workerController.js';
import { protectWorker } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateWorkerRegistrationInput, validateNearbyWorkersQuery } from '../validators/workerValidator.js';

const router = express.Router();

router.post('/register', upload.single('profilePicture'), validateWorkerRegistrationInput, registerWorker);
router.post('/login', loginWorker);
router.get('/profile', protectWorker, getWorkerProfile);
router.get('/nearby', validateNearbyWorkersQuery, getNearbyWorkers);
router.post('/recalculate-karma', protectWorker, recalculateKarmaScoresController);
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.get('/:id/availability', getWorkerAvailability);
router.get('/:id/reviews', getWorkerReviews);

export default router;
