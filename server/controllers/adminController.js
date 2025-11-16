const pool = require('../config/db');
const sendMail = require("../config/mailer");

/* -------------------------------------------------------
   ADMIN / PRINCIPAL DASHBOARD  (Pending Principal Approval)
--------------------------------------------------------*/
async function adminDashboard(req, res, next) {
  try {
    if (!['admin', 'principal'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const selectedDepartment = req.query.department || null;

    /* -------------------------------------------
       FETCH REQUESTS WAITING FOR PRINCIPAL
    --------------------------------------------*/
    const [requests] = await pool.query(
      `SELECT 
          lr.leave_id,
          lr.user_id,
          lr.department_code,
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
          lr.final_status,
          lr.applied_on,
          u1.name AS requester_name,
          u2.name AS substitute_name
       FROM leave_requests lr
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
       WHERE lr.hod_status = 'accepted'
         AND lr.principal_status = 'pending'
       ORDER BY lr.applied_on DESC`
    );

    /* -------------------------------------------
       OPTIONAL DEPARTMENT FILTER FOR HISTORY VIEW
    --------------------------------------------*/
    let query = `
      SELECT 
          lr.*,
          u1.name AS requester_name,
          u2.name AS substitute_name
      FROM leave_requests lr
      LEFT JOIN users u1 ON lr.user_id = u1.user_id
      LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
    `;

    const params = [];
    if (selectedDepartment) {
      query += " WHERE lr.department_code = ?";
      params.push(selectedDepartment);
    }

    query += " ORDER BY lr.applied_on DESC";

    const [institution_leaves] = await pool.query(query, params);

    res.json({ requests, institution_leaves });

  } catch (err) {
    next(err);
  }
}

/* -------------------------------------------------------
   PRINCIPAL APPROVE LEAVE
--------------------------------------------------------*/
async function approvePrincipal(req, res, next) {
  try {
    if (!['admin', 'principal'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const leaveId = req.params.id;

    /* -------------------------------------------
       FETCH APPLICANT EMAIL
    --------------------------------------------*/
    const [[row]] = await pool.query(
      `SELECT u.email, u.name 
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.leave_id = ?
       LIMIT 1`,
      [leaveId]
    );

    if (!row) {
      return res.status(404).json({ message: "Leave not found" });
    }

    /* -------------------------------------------
       UPDATE STATUS
    --------------------------------------------*/
    await pool.query(
      `UPDATE leave_requests 
       SET principal_status='accepted',
           final_status='approved',
           processed_on = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );

    res.json({ ok: true });

    /* -------------------------------------------
       NOTIFY ONLY APPLICANT (FINAL APPROVAL)
    --------------------------------------------*/
    await sendMail(
      row.email,
      "Leave Approved",
      `
        <h2>Hello ${row.name},</h2>
        <p>Your leave request has been <b>approved by the Principal</b>.</p>
        <p>Your leave is now fully approved.</p>
      `
    );

  } catch (err) {
    next(err);
  }
}

/* -------------------------------------------------------
   PRINCIPAL REJECT LEAVE
--------------------------------------------------------*/
async function rejectPrincipal(req, res, next) {
  try {
    if (!['admin', 'principal'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const leaveId = req.params.id;

    /* -------------------------------------------
       FETCH APPLICANT EMAIL
    --------------------------------------------*/
    const [[row]] = await pool.query(
      `SELECT u.email, u.name 
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.leave_id = ?
       LIMIT 1`,
      [leaveId]
    );

    if (!row) {
      return res.status(404).json({ message: "Leave not found" });
    }

    /* -------------------------------------------
       UPDATE STATUS
    --------------------------------------------*/
    await pool.query(
      `UPDATE leave_requests 
       SET principal_status='rejected',
           final_status='rejected',
           processed_on = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );

    res.json({ ok: true });

    /* -------------------------------------------
       NOTIFY ONLY APPLICANT
    --------------------------------------------*/
    await sendMail(
      row.email,
      "Leave Rejected by Principal",
      `
        <h2>Hello ${row.name},</h2>
        <p>Your leave request has been <b>rejected by the Principal</b>.</p>
        <p>This is the final decision.</p>
      `
    );

  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminDashboard,
  approvePrincipal,
  rejectPrincipal
};
