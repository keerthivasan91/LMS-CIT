const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { applyLeave, leaveHistory } = require('../controllers/leaveController');

router.post('/apply', auth(), applyLeave);
router.get('/leave_history', auth(), leaveHistory);

module.exports = router;
