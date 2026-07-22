const express = require('express');
const router = express.Router();
const { getWorkerAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/worker/:workerId', protect, getWorkerAnalytics);

module.exports = router;
