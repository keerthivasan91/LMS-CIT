const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/authMiddleware');
            // FIXED   

const { 
  hodDashboard, 
  approveHod, 
  rejectHod, 
  leaveBalance 
} = require('../controllers/hodController');

// HOD-only routes
router.get('/hod/requests', sessionAuth(["hod"]), hodDashboard);
router.post('/hod/approve/:rid', sessionAuth(["hod"]), approveHod);
router.post('/hod/reject/:rid', sessionAuth(["hod"]), rejectHod);
router.get('/hod/leave_balance', sessionAuth(["hod"]), leaveBalance);

module.exports = router;
