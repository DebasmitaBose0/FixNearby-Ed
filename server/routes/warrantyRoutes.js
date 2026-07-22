const express = require('express');
const router = express.Router();
const { fileWarrantyClaim } = require('../controllers/warrantyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/claim', protect, fileWarrantyClaim);

module.exports = router;
