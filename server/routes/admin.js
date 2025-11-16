const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');              // FIXED
const role = require('../middleware/roleMiddleware');    // For admin/principal access

const { 
  adminDashboard, 
  approvePrincipal, 
  rejectPrincipal 
} = require('../controllers/adminController');

// Only Admin and Principal can access these routes
router.get('/api/admin/requests', auth(), role(["admin", "principal"]), adminDashboard);

router.post('/api/admin/approve/:rid', auth(), role(["admin", "principal"]), approvePrincipal);

router.post('/api/admin/reject/:rid', auth(), role(["admin", "principal"]), rejectPrincipal);
module.exports = router;
