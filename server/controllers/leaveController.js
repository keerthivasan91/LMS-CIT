const pool = require('../config/db');
const sendMail = require("../config/mailer");

/* ------------------------------------------------------------------
   APPLY LEAVE  (FINAL SCHEMA MATCHING VERSION)
-------------------------------------------------------------------*/
async function applyLeave(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user_id = req.user.user_id;
    const department_code = req.user.department_code;
    const userEmail = req.user.email;

    const {
      leave_type = 'casual',
      start_date = null,
      start_session = 'FN',
      end_date = null,
      end_session = 'AN',
      reason = '',
      substitute_id = null
    } = req.body;

    /* ----------------------------------------------------------
       FIX: Convert FN/AN → Forenoon/Afternoon (matches ENUM)
    -----------------------------------------------------------*/
    const startSessionDB =
      start_session === "FN" ? "Forenoon" :
      start_session === "AN" ? "Afternoon" :
      start_session;

    const endSessionDB =
      end_session === "FN" ? "Forenoon" :
      end_session === "AN" ? "Afternoon" :
      end_session;

    /* ----------------------------------------------------------
       substitute_status rules
    -----------------------------------------------------------*/
    let substituteStatus = substitute_id ? "pending" : "pending";

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      /* ------------------------------------------------------
         CREATE leave_requests row
      -------------------------------------------------------*/
      const [result] = await conn.query(
        `INSERT INTO leave_requests 
          (user_id, department_code, leave_type, start_date, start_session, 
           end_date, end_session, reason, substitute_id, substitute_status)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          user_id,
          department_code,
          leave_type,
          start_date,
          startSessionDB,
          end_date,
          endSessionDB,
          reason,
          substitute_id,
          substituteStatus
        ]
      );

      const leave_id = result.insertId;

      /* ------------------------------------------------------
         CREATE arrangement entry if substitute is assigned
         arrangements: (arrangement_id, leave_id, substitute_id, status)
      -------------------------------------------------------*/
      if (substitute_id) {
        await conn.query(
          `INSERT INTO arrangements (leave_id, substitute_id, status)
           VALUES (?, ?, 'pending')`,
          [leave_id, substitute_id]
        );
      }

      await conn.commit();

      /* ------------------------------------------------------
         EMAIL CONFIRMATION
      -------------------------------------------------------*/
      await sendMail(
        userEmail,
        "Leave Request Submitted",
        `
          <h2>Leave Submitted</h2>
          <p>Your leave request from <b>${start_date}</b> to <b>${end_date}</b> has been submitted.</p>
        `
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

/* ------------------------------------------------------------------
   LEAVE HISTORY (unchanged & schema compliant)
-------------------------------------------------------------------*/
async function leaveHistory(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user_id = req.user.user_id;
    const role = req.user.role;
    const department_code = req.user.department_code;
    const selected_department = req.query.department || null;

    const conn = await pool.getConnection();

    try {
      // USER LEAVE HISTORY
      const [appliedLeaves] = await conn.query(
        `SELECT lr.*, s.name AS substitute_name
         FROM leave_requests lr
         LEFT JOIN users s ON lr.substitute_id = s.user_id
         WHERE lr.user_id = ?
         ORDER BY lr.applied_on DESC
         LIMIT 20`,
        [user_id]
      );

      // SUBSTITUTE REQUESTS
      const [substituteRequests] = await conn.query(
        `SELECT 
            lr.leave_id,
            lr.user_id,
            lr.leave_type,
            lr.start_date,
            lr.end_date,
            lr.days,
            lr.reason,
            lr.substitute_status,
            u.name AS requester_name
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         WHERE lr.substitute_id = ?
         ORDER BY lr.leave_id DESC
         LIMIT 20`,
        [user_id]
      );

      let departmentLeaves = [];
      if (role === "hod") {
        const [rows] = await conn.query(
          `SELECT lr.*, u1.name AS requester_name, u2.name AS substitute_name
           FROM leave_requests lr
           LEFT JOIN users u1 ON lr.user_id = u1.user_id
           LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
           WHERE u1.department_code = ?
           ORDER BY lr.applied_on DESC`,
          [department_code]
        );
        departmentLeaves = rows;
      }

      let institutionLeaves = [];
      let departments = [];

      if (role === "admin" || role === "principal") {
        const [deptRows] = await conn.query(
          `SELECT DISTINCT department_code 
           FROM users 
           WHERE role = 'faculty'`
        );

        departments = deptRows.map(d => d.department_code);

        let query =
          `SELECT lr.*, u1.name AS requester_name, u2.name AS substitute_name
           FROM leave_requests lr
           LEFT JOIN users u1 ON lr.user_id = u1.user_id
           LEFT JOIN users u2 ON lr.substitute_id = u2.user_id`;

        const params = [];
        if (selected_department) {
          query += " WHERE u1.department_code = ?";
          params.push(selected_department);
        }

        query += " ORDER BY lr.applied_on DESC";

        const [rows] = await conn.query(query, params);
        institutionLeaves = rows;
      }

      res.json({
        applied_leaves: appliedLeaves,
        substitute_requests: substituteRequests,
        department_leaves: departmentLeaves,
        institution_leaves: institutionLeaves,
        departments,
        selected_department
      });

    } finally {
      conn.release();
    }

  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyLeave,
  leaveHistory,
};
