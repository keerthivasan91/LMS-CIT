const LeaveModel = require("../models/Leave");
const HodService = require("../services/hodService");

async function hodDashboard(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dept = req.user.department_code;
    const requests = await LeaveModel.getPendingHodRequests(dept,req.user.user_id);

    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

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

async function leaveBalance(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dept = req.user.department_code;
    const leave_balances = await LeaveModel.getLeaveBalance(dept);

    res.json({ leave_balances });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  hodDashboard,
  approveHod,
  rejectHod,
  leaveBalance,
};
