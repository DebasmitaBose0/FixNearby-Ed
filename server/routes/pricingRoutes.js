import express from 'express';
import { estimateBookingPrice } from '../controllers/pricingController.js';

const router = express.Router();

router.post('/estimate', estimateBookingPrice);

export default router;
