const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const { 
  applyLeave, 
  leaveHistory 
} = require('../controllers/leaveController');

// Apply for leave → only faculty, staff, hod
router.post(
  '/leave/apply',
  auth(),
  role(["faculty", "staff", "hod"]),
  applyLeave
);

// Fetch leave history (auth required)
router.get(
  '/leave/history',
  auth(),
  leaveHistory
);

module.exports = router;
