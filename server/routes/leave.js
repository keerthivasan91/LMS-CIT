const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const { applyLeave, leaveHistory } = require('../controllers/leaveController');

router.post('/apply',sessionAuth, applyLeave);
router.get('/leave_history', sessionAuth, leaveHistory);

module.exports = router;
