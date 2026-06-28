import express from 'express';
import { getHealth, getReadiness, getServerInfo } from '../controllers/healthController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many health check requests' }
});

router.get('/health', healthLimiter, getHealth);
router.get('/health/readiness', healthLimiter, getReadiness);
router.get('/health/info', getServerInfo);

export default router;
