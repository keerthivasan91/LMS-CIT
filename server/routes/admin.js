const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');              // FIXED
const role = require('../middleware/roleMiddleware');   
const { adminAddUser } = require("../controllers/adminAddUser"); // For admin/principal access
const {
  getResetRequests,
  adminResetPasswordFinal
} = require("../controllers/adminResetPassword");


const { 
  adminDashboard, 
  approvePrincipal, 
  rejectPrincipal 
} = require('../controllers/adminController');

// Only Admin and Principal can access these routes
router.get('/api/admin/requests', auth(), role(["admin", "principal"]), adminDashboard);

router.post('/api/admin/approve/:rid', auth(), role(["admin", "principal"]), approvePrincipal);

router.post('/api/admin/reject/:rid', auth(), role(["admin", "principal"]), rejectPrincipal);

router.post("/add-user", auth(), role(["admin", "principal"]), adminAddUser);

router.post("/admin/reset-password", auth(), role(["admin", "principal"]), getResetRequests);

router.get("/admin/reset-requests", auth(), role(["admin","principal"]), getResetRequests);

router.post("/admin/reset-password-final", auth(), role(["admin","principal"]), adminResetPasswordFinal);

module.exports = router;
