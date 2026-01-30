const pool = require("../config/db");

/* ========================================================================
   HELPERS
======================================================================== */
function normalizeSession(val) {
  const v = (val || "").toLowerCase();
  if (v.startsWith("f")) return "Forenoon";
  if (v.startsWith("a")) return "Afternoon";
  return "Forenoon";
}

/* ========================================================================
   1) INSERT NEW LEAVE REQUEST
======================================================================== */
async function insertLeaveRequest(conn, data) {
  const {
    user_id,
    department_code,
    leave_type,
    start_date,
    start_session,
    end_date,
    end_session,
    reason,
    hasSubstitutes,
    userRole
  } = data;

  const startSession = normalizeSession(start_session);
  const endSession = normalizeSession(end_session);

  let final_substitute_status = hasSubstitutes ? "pending" : "accepted";
  let hod_status = "pending";
  let principal_status = "pending";
  let final_status = "pending";

  if (userRole === "hod") {
    hod_status = "approved";
  }

  if (userRole === "principal") {
    hod_status = "approved";
    principal_status = "approved";
    final_status = "approved";
  }

  const [res] = await conn.query(
    `INSERT INTO leave_requests
     (user_id, department_code, leave_type,
      start_date, start_session,
      end_date, end_session,
      reason,
      final_substitute_status,
      hod_status,
      principal_status,
      final_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      department_code,
      leave_type,
      start_date,
      startSession,
      end_date,
      endSession,
      reason,
      final_substitute_status,
      hod_status,
      principal_status,
      final_status
    ]
  );

  return res.insertId;
}

/* ========================================================================
   2) INSERT ARRANGEMENT
======================================================================== */
async function insertArrangement(conn, leave_id, substitute_id, details = null, dept = null) {
  const [res] = await conn.query(
    `INSERT INTO arrangements
     (leave_id, substitute_id, department_code, details, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [leave_id, substitute_id, dept, details]
  );
  return res.insertId;
}

/* ========================================================================
   3) SUBSTITUTE DETAILS
======================================================================== */
async function getSubstituteDetails(subId) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, department_code, role
     FROM users WHERE user_id = ? LIMIT 1`,
    [subId]
  );
  return row;
}

/* ========================================================================
   4) ARRANGEMENTS BY LEAVE
======================================================================== */
async function getArrangementsByLeave(leaveId) {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS substitute_name, u.email AS substitute_email
     FROM arrangements a
     LEFT JOIN users u ON a.substitute_id = u.user_id
     WHERE a.leave_id = ?
     ORDER BY a.arrangement_id`,
    [leaveId]
  );
  return rows;
}

/* ========================================================================
   5) USER APPLIED LEAVES
======================================================================== */
async function getAppliedLeaves(user_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, 
            COUNT(a.arrangement_id) AS arrangement_count,
            SUM(a.status='accepted') AS accepted_count
     FROM leave_requests lr
     LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
     WHERE lr.user_id = ?
     GROUP BY lr.leave_id
     ORDER BY lr.applied_on DESC`,
    [user_id]
  );
  return rows;
}

/* ========================================================================
   6) SUBSTITUTE REQUESTS
======================================================================== */
async function getSubstituteRequests(user_id) {
  const [rows] = await pool.query(
    `SELECT a.arrangement_id,
            a.status AS substitute_status,
            a.details,
            a.responded_on,
            lr.*,
            u.name AS requester_name
     FROM arrangements a
     JOIN leave_requests lr ON a.leave_id = lr.leave_id
     JOIN users u ON lr.user_id = u.user_id
     WHERE a.substitute_id = ?
     ORDER BY lr.start_date DESC`,
    [user_id]
  );
  return rows;
}

/* ========================================================================
   7) GET APPLICANT DETAILS
======================================================================== */
async function getApplicantDetails(leaveId) {
  const [[row]] = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.department_code, u.role
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ? LIMIT 1`,
    [leaveId]
  );
  return row;
}

/* ========================================================================
   8) GET LEAVE BY ID
======================================================================== */
async function getLeaveById(id) {
  const [[row]] = await pool.query(
    `SELECT lr.*, 
            u.name AS requester_name,
            u.email AS requester_email,
            u.department_code,
            u.role
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ? LIMIT 1`,
    [id]
  );
  return row;
}

/* ========================================================================
   9) HOD — PENDING REQUESTS
======================================================================== */
async function getPendingHodRequests(dept, hodId) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name as requester_name, u.designation
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.hod_status='pending'
       AND lr.final_substitute_status='accepted'
       AND u.department_code = ?
       AND lr.user_id != ?
     ORDER BY lr.applied_on DESC`,
    [dept, hodId]
  );
  return rows;
}

/* ========================================================================
   10) HOD STATUS UPDATE (NO BALANCE LOGIC)
======================================================================== */
async function updateHodStatus(leaveId, status) {
  await pool.query(
    status === "approved"
      ? `UPDATE leave_requests
         SET hod_status='approved', principal_status='pending'
         WHERE leave_id=?`
      : `UPDATE leave_requests
         SET hod_status='rejected',
             principal_status='rejected',
             final_status='rejected'
         WHERE leave_id=?`,
    [leaveId]
  );
}

/* ========================================================================
   11) PRINCIPAL STATUS UPDATE (NO DEDUCTION)
======================================================================== */
async function updatePrincipalStatus(leaveId, status) {
  await pool.query(
    status === "approved"
      ? `UPDATE leave_requests
         SET principal_status='approved',
             final_status='approved',
             processed_on=NOW()
         WHERE leave_id=?`
      : `UPDATE leave_requests
         SET principal_status='rejected',
             final_status='rejected',
             processed_on=NOW()
         WHERE leave_id=?`,
    [leaveId]
  );
}

/* ========================================================================
   12) DEPARTMENT LEAVES
======================================================================== */
async function getDepartmentLeaves(dept) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name, u.designation
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE u.department_code = ?
     ORDER BY lr.applied_on DESC`,
    [dept]
  );
  return rows;
}

/* ========================================================================
   13) GET DEPARTMENTS
======================================================================== */
async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code
     FROM users
     WHERE role IN ('faculty','hod','staff','admin')
     ORDER BY department_code`
  );
  return rows;
}

/* ========================================================================
   14) INSTITUTION LEAVES
======================================================================== */
async function getInstitutionLeaves(dept = null) {
  let sql = `
    SELECT lr.*, u.name, u.department_code
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id`;
  const params = [];

  if (dept) {
    sql += ` WHERE u.department_code = ?`;
    params.push(dept);
  }

  sql += ` ORDER BY lr.applied_on DESC`;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/* ========================================================================
   15) STAFF BY DEPARTMENT
======================================================================== */
async function getStaffByDepartment(dept) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email
     FROM users
     WHERE department_code = ?
       AND role IN ('staff','admin')
       AND is_active = 1
     ORDER BY name`,
    [dept]
  );
  return rows;
}

/* ========================================================================
   16) FACULTY BY DEPARTMENT
======================================================================== */
async function getFacultyByDepartment(dept) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email
     FROM users
     WHERE department_code = ?
       AND role IN ('faculty','hod')
       AND is_active = 1
     ORDER BY name`,
    [dept]
  );
  return rows;
}

/* ========================================================================
   17) PRINCIPAL PENDING REQUESTS
======================================================================== */
async function getPendingPrincipalRequests() {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name, u.department_code
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.principal_status='pending'
       AND lr.hod_status='approved'
       AND lr.final_status='pending'
     ORDER BY lr.applied_on DESC`
  );
  return rows;
}

/* ========================================================================
   EXPORT
======================================================================== */
module.exports = {
  normalizeSession,
  insertLeaveRequest,
  insertArrangement,
  getSubstituteDetails,
  getArrangementsByLeave,
  getAppliedLeaves,
  getSubstituteRequests,
  getApplicantDetails,
  getLeaveById,
  getPendingHodRequests,
  updateHodStatus,
  updatePrincipalStatus,
  getDepartmentLeaves,
  getDepartments,
  getInstitutionLeaves,
  getStaffByDepartment,
  getFacultyByDepartment,
  getPendingPrincipalRequests
};
