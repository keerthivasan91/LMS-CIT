const pool = require("../config/db");
const sendMail = require("../config/mailer");

/* ------------------------------------------------------------------
   HOD DASHBOARD – Pending Requests
-------------------------------------------------------------------*/
async function hodDashboard(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dept = req.user.department_code;

    const [rows] = await pool.query(
      `SELECT 
          lr.leave_id,
          lr.user_id,
          lr.leave_type,
          lr.start_date,
          lr.start_session,
          lr.end_date,
          lr.end_session,
          lr.reason,
          lr.days,
          lr.substitute_id,
          lr.substitute_status,
          lr.hod_status,
          lr.principal_status,
          lr.applied_on,
          u1.name AS requester_name,
          u1.email AS requester_email,
          u2.name AS substitute_name
       FROM leave_requests lr
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
       WHERE lr.department_code = ?
         AND (lr.substitute_status = 'accepted' OR lr.substitute_id IS NULL)
         AND lr.hod_status = 'pending'
       ORDER BY lr.applied_on DESC`,
      [dept]
    );

    res.json({ requests: rows });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   APPROVE BY HOD
-------------------------------------------------------------------*/
async function approveHod(req, res, next) {
  try {
    const leaveId = req.params.rid;

    // Fetch applicant email
    const [row] = await pool.query(
      `SELECT u.email, u.name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.leave_id = ?
       LIMIT 1`,
      [leaveId]
    );

    if (!row.length) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const facultyEmail = row[0].email;
    const facultyName = row[0].name;

    // Update workflow states
    await pool.query(
      `UPDATE leave_requests 
       SET 
         hod_status = 'accepted',
         principal_status = 'pending',
         updated_at = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );

    res.json({ ok: true, message: "Leave approved by HOD" });

    // Notify ONLY applicant
    await sendMail(
      facultyEmail,
      "Leave Approved by HOD",
      `
        <h2>Hello ${facultyName},</h2>
        <p>Your leave request has been <b>approved by the HOD</b>.</p>
        <p>It has now been forwarded to the <b>Principal</b> for final approval.</p>
      `
    );
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   REJECT BY HOD
-------------------------------------------------------------------*/
async function rejectHod(req, res, next) {
  try {
    const leaveId = req.params.rid;

    // Fetch applicant
    const [row] = await pool.query(
      `SELECT u.email, u.name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.leave_id = ?
       LIMIT 1`,
      [leaveId]
    );

    if (!row.length) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const facultyEmail = row[0].email;
    const facultyName = row[0].name;

    // Reject – end workflow
    await pool.query(
      `UPDATE leave_requests 
       SET 
         hod_status = 'rejected',
         principal_status = NULL,
         final_status = 'rejected',
         updated_at = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );

    res.json({ ok: true, message: "Leave rejected by HOD" });

    // Notify ONLY applicant
    await sendMail(
      facultyEmail,
      "Leave Rejected by HOD",
      `
        <h2>Hello ${facultyName},</h2>
        <p>Your leave request has been <b>rejected by the HOD</b>.</p>
        <p>This decision is final.</p>
      `
    );
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   HOD – LEAVE BALANCE / SUMMARY
-------------------------------------------------------------------*/
async function leaveBalance(req, res, next) {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dept = req.user.department_code;

    const [rows] = await pool.query(
      `SELECT 
          u.name,
          COUNT(lr.leave_id) AS total,
          SUM(lr.final_status = 'approved') AS approved,
          SUM(lr.final_status = 'rejected') AS rejected,
          SUM(lr.final_status = 'pending') AS pending,
          COALESCE(SUM(lr.days), 0) AS total_days
       FROM users u
       LEFT JOIN leave_requests lr 
         ON u.user_id = lr.user_id
       WHERE u.department_code = ?
         AND u.role IN ('faculty', 'staff')
       GROUP BY u.user_id, u.name
       ORDER BY u.name`,
      [dept]
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
