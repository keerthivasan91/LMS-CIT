// models/admin.js

const pool = require("../config/db");
const LeaveModel = require("./Leave");

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
     WHERE lr.hod_status = 'approved'
       AND lr.principal_status = 'pending'
     ORDER BY lr.applied_on DESC`
  );
  return rows;
}

/* ============================================================
   INSTITUTION LEAVES FILTER
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
   GET APPLICANT EMAIL
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
   PRINCIPAL APPROVE / REJECT
============================================================ */
async function approveLeavePrincipal(leave_id) {
  return await LeaveModel.updatePrincipalStatus(leave_id, "approved");
}

async function rejectLeavePrincipal(leave_id) {
  return await LeaveModel.updatePrincipalStatus(leave_id, "rejected");
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

async function getAllUsers() {
  const [rows] = await pool.query(
    `SELECT user_id, name, role FROM users WHERE role != 'admin'`
  );
  return rows;
}




/* ============================================================
   GET USER BY ID (for delete validation)
============================================================ */
async function getUserById(user_id) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, role 
     FROM users 
     WHERE user_id = ?
     LIMIT 1`,
    [user_id]
  );
  return row;
}

/* ============================================================
   DELETE USER (FK cascades handle related tables)
============================================================ */
async function deleteUser(user_id) {
  // CASCADE deletes will automatically remove:
  // - leave_requests
  // - leave_balance
  // - arrangements
  // - any other child table
  await pool.query(
    `UPDATE users 
     SET is_active = 0, updated_at = NOW() 
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
  resetPasswordAndResolve,
  getUserById,
  getAllUsers,
  deleteUser
};
