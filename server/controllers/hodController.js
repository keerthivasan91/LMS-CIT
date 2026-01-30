const pool = require("../config/db");
const LeaveModel = require("../models/Leave");
const HodService = require("../services/hodService");

/* ================= HOD DASHBOARD ================= */

async function hodDashboard(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const requests = await LeaveModel.getPendingHodRequests(
      req.user.department_code,
      req.user.user_id
    );

    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

/* ================= APPROVE / REJECT ================= */

async function approveHod(req, res, next) {
  try {
    await HodService.approveLeave(req.params.rid);
    res.json({ ok: true, message: "Leave approved by HOD" });
  } catch (err) {
    next(err);
  }
}

async function rejectHod(req, res, next) {
  try {
    await HodService.rejectLeave(req.params.rid);
    res.json({ ok: true, message: "Leave rejected by HOD" });
  } catch (err) {
    next(err);
  }
}

/* ================= VIEW DEPARTMENT LEAVE BALANCE ================= */

async function leaveBalance(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const year = new Date().getFullYear();
    const dept = req.user.department_code;

    const [rows] = await pool.query(
      `SELECT 
          u.user_id,
          u.name,
          u.designation,
          lb.casual_total,
          lb.casual_used,
          (lb.casual_total - lb.casual_used) AS casual_remaining,
          lb.earned_total,
          lb.earned_used,
          (lb.earned_total - lb.earned_used) AS earned_remaining,
          lb.rh_total,
          lb.rh_used,
          (lb.rh_total - lb.rh_used) AS rh_remaining
       FROM users u
       LEFT JOIN leave_balance lb
         ON u.user_id = lb.user_id
        AND lb.academic_year = ?
       WHERE u.department_code = ?
         AND u.is_active = 1
       ORDER BY u.name`,
      [year, dept]
    );

    res.json({ leave_balances: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  hodDashboard,
  approveHod,
  rejectHod,
  leaveBalance
};
