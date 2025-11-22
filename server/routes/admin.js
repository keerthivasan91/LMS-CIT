const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/authMiddleware');
  
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
router.get('/admin/requests', sessionAuth(["admin", "principal"]), adminDashboard);

router.post('/admin/approve/:rid', sessionAuth(["admin", "principal"]), approvePrincipal);

router.post('/admin/reject/:rid', sessionAuth(["admin", "principal"]), rejectPrincipal);
router.post("/add-user", sessionAuth(["admin", "principal"]), adminAddUser);

router.post("/admin/reset-password", sessionAuth(["admin", "principal"]), getResetRequests);

router.get("/admin/reset-requests", sessionAuth(["admin", "principal"]), getResetRequests);
router.post("/admin/reset-password-final", sessionAuth(["admin", "principal"]), adminResetPasswordFinal);

module.exports = router;
