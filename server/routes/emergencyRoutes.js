const express = require('express');
const router = express.Router();
const { createEmergencyBroadcast, claimEmergencyJob } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/broadcast', protect, createEmergencyBroadcast);
router.post('/:id/claim', protect, claimEmergencyJob);

module.exports = router;
