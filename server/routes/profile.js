const express = require("express");
const router = express.Router();

const sessionAuth = require("../middleware/authMiddleware");

const {
  applyLeave,
  leaveHistory
} = require("../controllers/leaveController");

const { getLeaveBalance } = require("../controllers/leaveBalanceController");

/* ================= LEAVE ROUTES ================= */

// Apply for leave → faculty, staff, hod only
router.post(
  "/leave/apply",
  sessionAuth(["faculty", "staff", "hod", "principal"]),
  applyLeave
);

// View own leave history
router.get(
  "/leave_history",
  sessionAuth(),
  leaveHistory
);

// View own leave balance (policy-based)
router.get(
  "/leave-balance",
  sessionAuth(),
  getLeaveBalance
);

module.exports = router;
