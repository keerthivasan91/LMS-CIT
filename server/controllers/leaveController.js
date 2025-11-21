// controllers/leaveController.js

const pool = require("../config/db");
const sendMail = require("../config/mailer");
const LeaveModel = require("../models/Leave");

/* ============================================================
   APPLY LEAVE
============================================================ */
async function applyLeave(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user_id = req.user.user_id;
    const department_code = req.user.department_code;
    const userEmail = req.user.email;

    const {
      leave_type = 'Casual Leave',
      start_date,
      start_session = "FN",
      end_date,
      end_session = "AN",
      reason = '',
      substitute_id = ''
    } = req.body;

    const startSessionDB = start_session === "FN" ? "Forenoon" : "Afternoon";
    const endSessionDB = end_session === "FN" ? "Forenoon" : "Afternoon";
    const substituteStatus = substitute_id ? "pending" : null;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      /// insert leave
      const leave_id = await LeaveModel.insertLeaveRequest({
        user_id,
        department_code,
        leave_type,
        start_date,
        start_session: startSessionDB,
        end_date,
        end_session: endSessionDB,
        reason,
        substitute_id,
        substitute_status: substituteStatus
      });

      if (substitute_id) {
        await LeaveModel.insertArrangement(leave_id, substitute_id);

        const sub = await LeaveModel.getSubstituteDetails(substitute_id);

        if (sub?.email) {
          await sendMail(
            sub.email,
            "Substitute Request Assigned",
            `<p>You have been requested to substitute from ${start_date} to ${end_date}</p>`
          );
        }
      }

      await conn.commit();

      await sendMail(
        userEmail,
        "Leave Request Submitted",
        `<p>Your leave request is submitted successfully.</p>`
      );

      res.json({ ok: true, leave_id });

    } catch (err) {
      await conn.rollback();
      next(err);
    } finally {
      conn.release();
    }

  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LEAVE HISTORY
============================================================ */
async function leaveHistory(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { role, user_id, department_code } = req.user;
    const selected_department = req.query.department || null;

    const applied_leaves = await LeaveModel.getAppliedLeaves(user_id);
    const substitute_requests = await LeaveModel.getSubstituteRequests(user_id);

    let department_leaves = [];
    let institution_leaves = [];
    let departments = [];

    if (role === "hod") {
      department_leaves = await LeaveModel.getDepartmentLeaves(department_code);
    }

    if (role === "admin" || role === "principal") {
      departments = await LeaveModel.getDepartments();
      institution_leaves = await LeaveModel.getInstitutionLeaves(selected_department);
    }

    res.json({
      applied_leaves,
      substitute_requests,
      department_leaves,
      institution_leaves,
      departments,
      selected_department
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyLeave,
  leaveHistory
};
