// models/admin.js

const pool = require("../config/db");

/* ============================================================
   ADMIN DASHBOARD → PENDING PRINCIPAL APPROVALS
============================================================ */
async function getPrincipalPending() {
  const [rows] = await pool.query(
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
  return rows;
}

/* ============================================================
   DEPARTMENT FILTER FOR ADMIN PRINCIPAL HISTORY VIEW
============================================================ */
async function getInstitutionLeaves(selectedDepartment = null) {
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
    query += " WHERE lr.department_code = ? ";
    params.push(selectedDepartment);
  }

  query += " ORDER BY lr.applied_on DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/* ============================================================
   PRINCIPAL APPROVE / REJECT → FETCH APPLICANT EMAIL
============================================================ */
async function getApplicantEmail(leave_id) {
  const [[row]] = await pool.query(
    `SELECT u.email, u.name 
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ?
     LIMIT 1`,
    [leave_id]
  );
  return row;
}

/* ============================================================
   PRINCIPAL APPROVE REQUEST
============================================================ */
async function approveLeavePrincipal(leave_id) {
  await pool.query(
    `UPDATE leave_requests 
     SET principal_status='accepted',
         final_status='approved',
         processed_on = NOW()
     WHERE leave_id = ?`,
    [leave_id]
  );
}

/* ============================================================
   PRINCIPAL REJECT REQUEST
============================================================ */
async function rejectLeavePrincipal(leave_id) {
  await pool.query(
    `UPDATE leave_requests 
     SET principal_status='rejected',
         final_status='rejected',
         processed_on = NOW()
     WHERE leave_id = ?`,
    [leave_id]
  );
}

/* ============================================================
   PASSWORD RESET REQUESTS
============================================================ */
async function getPendingPasswordResets() {
  const [rows] = await pool.query(
    `SELECT user_id, email, created_at 
     FROM password_reset_requests 
     WHERE status = 'pending'
     ORDER BY created_at DESC`
  );

  return rows;
}

/* ============================================================
   UPDATE PASSWORD + MARK REQUEST RESOLVED
============================================================ */
async function resetPasswordAndResolve(user_id, hashedPassword) {
  await pool.query(
    `UPDATE users SET password = ? WHERE user_id = ?`,
    [hashedPassword, user_id]
  );

  await pool.query(
    `UPDATE password_reset_requests 
     SET status='resolved', resolved_at=NOW() 
     WHERE user_id = ?`,
    [user_id]
  );
}

module.exports = {
  getPrincipalPending,
  getInstitutionLeaves,
  getApplicantEmail,
  approveLeavePrincipal,
  rejectLeavePrincipal,
  getPendingPasswordResets,
  resetPasswordAndResolve
};
