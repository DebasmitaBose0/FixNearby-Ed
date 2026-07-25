import express from 'express';
import {
  getEarningsDashboard,
  getEarningsHistory,
  requestPayout,
  getPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  exportEarningsCSV,
} from '../controllers/earningController.js';
import { protectWorker } from '../middleware/authMiddleware.js';

const router = express.Router();

// All earning routes require worker authentication
router.use(protectWorker);

router.get('/summary', getEarningsDashboard);
router.get('/dashboard/stats', getEarningsDashboard);
router.get('/history', getEarningsHistory);
router.post('/request-payout', requestPayout);
router.post('/payout', requestPayout);

// Payout Method Management
router.get('/payout-methods', getPayoutMethods);
router.post('/payout-methods', addPayoutMethod);
router.delete('/payout-methods/:id', deletePayoutMethod);

// CSV Export
router.get('/export-csv', exportEarningsCSV);

export default router;
