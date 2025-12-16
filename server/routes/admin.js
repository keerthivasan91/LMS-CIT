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
  adminGetUsers,
  rejectPrincipal 
} = require('../controllers/adminController');

// Only Admin and Principal can access these routes
router.get('/admin/requests', sessionAuth([ "principal"]), adminDashboard);

router.post('/admin/approve/:rid', sessionAuth([ "principal"]), approvePrincipal);

router.post('/admin/reject/:rid', sessionAuth(["principal"]), rejectPrincipal);
router.post("/add-user", sessionAuth(["admin"]), adminAddUser);

router.post("/admin/reset-password", sessionAuth(["admin"]), getResetRequests);

router.get("/admin/reset-requests", sessionAuth(["admin"]), getResetRequests);
router.post("/admin/reset-password-final", sessionAuth(["admin"]), adminResetPasswordFinal);

// routes/admin.js
router.get("/admin/users", sessionAuth(["admin", "principal"]), adminGetUsers);


router.delete("/admin/delete-user/:userId", sessionAuth(["admin"]), require("../controllers/adminDeleteUser").adminDeleteUser);

module.exports = router;
