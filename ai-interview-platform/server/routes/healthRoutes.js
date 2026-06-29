const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'UP',
    database: dbStatus,
    timestamp: new Date()
  });
});
module.exports = router;
