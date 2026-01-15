const express = require("express");
const router = express.Router();
const sessionAuth = require("../middleware/authMiddleware");

const { adminAddUser } = require("../controllers/adminAddUser");
const { adminDeleteUser } = require("../controllers/adminDeleteUser");
const {
  adminDashboard,
  approvePrincipal,
  rejectPrincipal,
  approveBulk,
  rejectBulk,
  adminViewUsers,
  adminViewUserProfile,
  downloadLeaveHistory
} = require("../controllers/adminController");

const {
  getResetRequests,
  adminResetPasswordFinal
} = require("../controllers/adminResetPassword");

/* ================= ADMIN ROUTES ================= */

router.get("/admin/requests", sessionAuth(["principal"]), adminDashboard);
router.post("/admin/approve/:rid", sessionAuth(["principal"]), approvePrincipal);
router.post("/admin/reject/:rid", sessionAuth(["principal"]), rejectPrincipal);
router.post("/admin/approve-bulk", sessionAuth(["principal"]), approveBulk);
router.post("/admin/reject-bulk", sessionAuth(["principal"]), rejectBulk);


router.post("/add-user", sessionAuth(["admin"]), adminAddUser);

router.get("/admin/users", sessionAuth(["admin", "principal"]), adminViewUsers);
router.delete("/admin/delete-user/:userId", sessionAuth(["admin"]), adminDeleteUser);

router.get("/admin/reset-requests", sessionAuth(["admin"]), getResetRequests);
router.post("/admin/reset-password-final", sessionAuth(["admin"]), adminResetPasswordFinal);
router.get(
  "/admin/users/:userId",
  sessionAuth(["admin"]),
  adminViewUserProfile
);

router.get(
  "/leave-history/download",
  sessionAuth(["admin", "principal"]),
  downloadLeaveHistory
);

module.exports = router;
