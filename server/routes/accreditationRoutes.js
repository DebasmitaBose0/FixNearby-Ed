const express = require('express');
const router = express.Router();
const { addAccreditation, getWorkerAccreditations } = require('../controllers/accreditationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addAccreditation);
router.get('/worker/:workerId', getWorkerAccreditations);

module.exports = router;
