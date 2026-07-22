const express = require('express');
const router = express.Router();
const { checkIn } = require('../controllers/telemetryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);

module.exports = router;
