const express = require('express');
const router = express.Router();

const sessionAuth = require('../middleware/authMiddleware');

const { 
  applyLeave, 
  leaveHistory 
} = require('../controllers/leaveController');

// Apply for leave → only faculty, staff, hod
router.post(
  '/leave/apply',
  sessionAuth(["faculty","staff","hod"]),
  applyLeave
);

// Fetch leave history (auth required)
router.get(
  '/leave/history',
  sessionAuth(),
  leaveHistory
);

module.exports = router;
