const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');

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
router.get('/api/admin/requests', sessionAuth, role(["admin", "principal"]), adminDashboard);

router.post('/api/admin/approve/:rid', sessionAuth, role(["admin", "principal"]), approvePrincipal);

router.post('/api/admin/reject/:rid', sessionAuth, role(["admin", "principal"]), rejectPrincipal);
router.post("/add-user", sessionAuth, role(["admin", "principal"]), adminAddUser);

router.post("/admin/reset-password", sessionAuth, role(["admin", "principal"]), getResetRequests);

router.get("/admin/reset-requests", sessionAuth, role(["admin","principal"]), getResetRequests);

router.post("/admin/reset-password-final", sessionAuth, role(["admin","principal"]), adminResetPasswordFinal);

module.exports = router;
