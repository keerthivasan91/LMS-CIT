const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
            // FIXED
const role = require('../middleware/roleMiddleware');    // optional

const { 
  hodDashboard, 
  approveHod, 
  rejectHod, 
  leaveBalance 
} = require('../controllers/hodController');

// HOD-only routes
router.get('/hod/requests', sessionAuth, role(["hod"]), hodDashboard);
router.post('/hod/approve/:rid', sessionAuth, role(["hod"]), approveHod);
router.post('/hod/reject/:rid', sessionAuth, role(["hod"]), rejectHod);
router.get('/hod/leave_balance', sessionAuth, role(["hod"]), leaveBalance);

module.exports = router;
