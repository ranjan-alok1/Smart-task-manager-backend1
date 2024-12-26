const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/aiController');

router.post('/insights', getInsights);

module.exports = router; 