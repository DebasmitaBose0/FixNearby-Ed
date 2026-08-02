import express from 'express';
import * as disputeController from '../controllers/disputeEscalationController.js';
import { validateDisputeFiling } from '../middleware/disputeEscalationValidation.js';

const router = express.Router();

router.post('/', validateDisputeFiling, disputeController.fileDispute);
router.post('/:disputeId/evidence', disputeController.addEvidence);
router.patch('/:disputeId/resolve', disputeController.resolveDispute);
router.get('/booking/:bookingId', disputeController.getDisputes);

export default router;
