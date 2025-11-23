const express = require('express');
const router = express.Router();

const sessionAuth = require('../middleware/authMiddleware');

const { 
  applyLeave, 
  leaveHistory 
} = require('../controllers/leaveController');

const { getLeaveBalance } = require('../controllers/profileController');

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

router.get('/leave-balance', sessionAuth(), getLeaveBalance);


module.exports = router;
