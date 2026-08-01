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
import { protectWorker, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All earning routes require worker/provider authentication & role check
router.use(protectWorker, requireRole('provider', 'worker', 'admin'));

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
