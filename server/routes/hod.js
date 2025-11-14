const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');              // FIXED
const role = require('../middleware/roleMiddleware');    // optional

const { 
  hodDashboard, 
  approveHod, 
  rejectHod, 
  leaveBalance 
} = require('../controllers/hodController');

// HOD-only routes
router.get('/hod/requests', auth(), role(["hod"]), hodDashboard);
router.post('/hod/approve/:rid', auth(), role(["hod"]), approveHod);
router.post('/hod/reject/:rid', auth(), role(["hod"]), rejectHod);
router.get('/hod/leave_balance', auth(), role(["hod"]), leaveBalance);

module.exports = router;
