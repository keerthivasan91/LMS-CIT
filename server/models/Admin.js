// models/Admin.js

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
        lr.hod_status,
        lr.principal_status,
        lr.final_status,
        lr.applied_on,
        u1.name AS requester_name,
        u2.name AS substitute_name,
        a.substitute_id,
        a.status AS substitute_status,
        a.details AS substitute_details
     FROM leave_requests lr
     LEFT JOIN users u1 ON lr.user_id = u1.user_id
     LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
     LEFT JOIN users u2 ON a.substitute_id = u2.user_id
     WHERE lr.hod_status = 'approved'
       AND lr.principal_status = 'pending'
       AND lr.leave_type = 'OOD'
     ORDER BY lr.applied_on DESC`
  );
  return rows;
}

/* ============================================================
   INSTITUTION LEAVES FILTER - FIXED
============================================================ */
async function getInstitutionLeaves(selectedDepartment = null) {
  let query = `
    SELECT 
        lr.*,
        u1.name AS requester_name,
        d.department_name,
        a.substitute_id,
        a.status AS substitute_status,
        u2.name AS substitute_name
    FROM leave_requests lr
    LEFT JOIN users u1 ON lr.user_id = u1.user_id
    LEFT JOIN departments d ON lr.department_code = d.department_code
    LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
    LEFT JOIN users u2 ON a.substitute_id = u2.user_id
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
   GET ALL USERS FOR ADMIN
============================================================ */
async function getAllUsers() {
  const [rows] = await pool.query(
    `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.department_code,
        u.designation,
        u.date_joined,
        d.department_name,
        lb.casual_total - lb.casual_used AS casual_remaining,
        lb.earned_total - lb.earned_used AS earned_remaining
     FROM users u
     LEFT JOIN departments d ON u.department_code = d.department_code
     LEFT JOIN leave_balance lb ON u.user_id = lb.user_id AND lb.academic_year = YEAR(CURDATE())
     WHERE u.role != 'admin' AND u.is_active = 1
     ORDER BY u.department_code, u.role, u.name`
  );
  return rows;
}

/* ============================================================
   GET USER BY ID (for delete validation)
============================================================ */
async function getUserById(user_id) {
  const [[row]] = await pool.query(
    `SELECT 
        user_id,
        name,
        email,
        role,
        department_code,
        designation
     FROM users 
     WHERE user_id = ?
     LIMIT 1`,
    [user_id]
  );
  return row;
}

/* ============================================================
   SOFT DELETE USER (set is_active = 0)
============================================================ */
async function deleteUser(user_id) {
  const [result] = await pool.query(
    `UPDATE users 
     SET is_active = 0, updated_at = NOW() 
     WHERE user_id = ?`,
    [user_id]
  );
  return result.affectedRows > 0;
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
    `SELECT 
        prr.user_id,
        prr.email,
        prr.created_at,
        u.name,
        u.role,
        u.department_code,
        DATEDIFF(NOW(), prr.created_at) AS days_pending
     FROM password_reset_requests prr
     LEFT JOIN users u ON prr.user_id = u.user_id
     WHERE prr.status = 'pending'
     ORDER BY prr.created_at DESC`
  );
  return rows;
}

/* ============================================================
   UPDATE PASSWORD + MARK REQUEST RESOLVED
============================================================ */
async function resetPasswordAndResolve(user_id, hashedPassword) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    await connection.query(
      `UPDATE users SET password = ?, updated_at = NOW() 
       WHERE user_id = ?`,
      [hashedPassword, user_id]
    );

    await connection.query(
      `UPDATE password_reset_requests 
       SET status='resolved', resolved_at=NOW() 
       WHERE user_id = ? AND status = 'pending'`,
      [user_id]
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* ============================================================
   GET DEPARTMENTS FOR FILTERING
============================================================ */
async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT department_code, department_name 
     FROM departments 
     WHERE is_active = 1
     ORDER BY department_name`
  );
  return rows;
}

/* ============================================================
   GET STATISTICS FOR ADMIN DASHBOARD
============================================================ */
async function getAdminStats() {
  const [rows] = await pool.query(
    `SELECT 
        -- Total users
        (SELECT COUNT(*) FROM users WHERE is_active = 1) AS total_users,
        
        -- Active faculty
        (SELECT COUNT(*) FROM users WHERE role = 'faculty' AND is_active = 1) AS total_faculty,
        
        -- Pending principal approvals
        (SELECT COUNT(*) FROM leave_requests 
         WHERE hod_status = 'approved' 
           AND principal_status = 'pending'
           AND final_status = 'pending') AS pending_principal_approvals,
        
        -- Pending password resets
        (SELECT COUNT(*) FROM password_reset_requests 
         WHERE status = 'pending') AS pending_password_resets,
        
        -- Today's leaves
        (SELECT COUNT(*) FROM leave_requests 
         WHERE final_status = 'approved' 
           AND CURDATE() BETWEEN start_date AND end_date) AS today_leaves,
        
        -- Monthly leave trend
        (SELECT COUNT(*) FROM leave_requests 
         WHERE final_status = 'approved' 
           AND MONTH(applied_on) = MONTH(CURDATE())) AS this_month_leaves
    `
  );
  return rows[0];
}

/* ============================================================
   GET RECENT ACTIVITY
============================================================ */
async function getRecentActivity(limit = 10) {
  const [rows] = await pool.query(
    `SELECT 
        'leave' AS type,
        lr.leave_id AS id,
        CONCAT('Leave applied by ', u.name) AS description,
        lr.applied_on AS timestamp
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     
     UNION ALL
     
     SELECT 
        'approval' AS type,
        lr.leave_id AS id,
        CONCAT('Leave ', lr.final_status, ' for ', u.name) AS description,
        lr.updated_at AS timestamp
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.final_status IN ('approved', 'rejected')
     
     UNION ALL
     
     SELECT 
        'password_reset' AS type,
        prr.request_id AS id,
        CONCAT('Password reset requested by ', u.name) AS description,
        prr.created_at AS timestamp
     FROM password_reset_requests prr
     JOIN users u ON prr.user_id = u.user_id
     
     ORDER BY timestamp DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  getPrincipalPending,
  getInstitutionLeaves,
  getAllUsers,
  getUserById,
  deleteUser,
  getApplicantEmail,
  approveLeavePrincipal,
  rejectLeavePrincipal,
  getPendingPasswordResets,
  resetPasswordAndResolve,
  getDepartments,
  getAdminStats,
  getRecentActivity
};