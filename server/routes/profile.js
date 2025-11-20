const express = require('express');
const router = express.Router();

const sessionAuth = require('../middleware/sessionAuth');
const role = require('../middleware/roleMiddleware');

const { 
  applyLeave, 
  leaveHistory 
} = require('../controllers/leaveController');

// Apply for leave → only faculty, staff, hod
router.post(
  '/leave/apply',
  sessionAuth,
  role(["faculty", "staff", "hod"]),
  applyLeave
);

// Fetch leave history (auth required)
router.get(
  '/leave/history',
  sessionAuth,
  leaveHistory
);

module.exports = router;
