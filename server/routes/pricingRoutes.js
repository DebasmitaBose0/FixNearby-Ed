const express = require('express');
const router = express.Router();
const { getQuote } = require('../controllers/pricingController');

router.get('/quote', getQuote);

module.exports = router;
