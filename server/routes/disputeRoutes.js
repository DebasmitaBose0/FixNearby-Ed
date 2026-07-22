const express = require('express');
const router = express.Router();
const { createDispute, getDisputes, getDisputeById, resolveDispute } = require('../controllers/disputeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createDispute);
router.get('/', protect, admin, getDisputes);
router.get('/:id', protect, getDisputeById);
router.patch('/:id/resolve', protect, admin, resolveDispute);

module.exports = router;
