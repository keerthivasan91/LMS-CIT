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

  let hod_status = null;
  let principal_status = null;
  let final_substitute_status = "pending";

  // If no substitutes → auto accept substitute stage
  if (!hasSubstitutes) {
    final_substitute_status = "accepted";

    if (userRole === "hod") {
      hod_status = "approved";          // HOD applying → skip HOD stage
      principal_status = "pending";
    } else {
      hod_status = "pending";           // Faculty applies → goes to HOD
    }
  }

  const [res] = await conn.query(
    `INSERT INTO leave_requests
      (user_id, department_code, leave_type,
       start_date, start_session,
       end_date, end_session,
       reason,
       final_substitute_status,
       hod_status, principal_status,
       final_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
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
      principal_status
    ]
  );

  return res.insertId;
}

/* ========================================================================
   2) INSERT ARRANGEMENT ROW
======================================================================== */
async function insertArrangement(conn, leave_id, substitute_id, details = null, dept = null) {
  const [res] = await conn.query(
    `INSERT INTO arrangements
      (leave_id, substitute_id, department_code, details, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [leave_id, substitute_id, dept || null, details || null]
  );

  return res.insertId;
}

/* ========================================================================
   3) GET SUBSTITUTE DETAILS
======================================================================== */
async function getSubstituteDetails(subId) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, department_code
     FROM users
     WHERE user_id = ?
     LIMIT 1`,
    [subId]
  );

  return row;
}

/* ========================================================================
   4) GET ARRANGEMENTS FOR A LEAVE
======================================================================== */
async function getArrangementsByLeave(leaveId) {
  const [rows] = await pool.query(
    `SELECT *
     FROM arrangements
     WHERE leave_id = ?
     ORDER BY arrangement_id ASC`,
    [leaveId]
  );

  return rows;
}

/* ========================================================================
   5) UPDATE ARRANGEMENT STATUS
      AND SYNC final_substitute_status PROPERLY
======================================================================== */
async function updateArrangementStatus(arrangementId, status) {
  // 1 — Update arrangement row
  await pool.query(
    `UPDATE arrangements
     SET status = ?, responded_on = NOW()
     WHERE arrangement_id = ?`,
    [status, arrangementId]
  );

  // 2 — Get leave ID
  const [[row]] = await pool.query(
    `SELECT leave_id
     FROM arrangements
     WHERE arrangement_id = ?
     LIMIT 1`,
    [arrangementId]
  );

  if (!row) return;

  const leaveId = row.leave_id;

  // 3 — Get all arrangement statuses
  const [arrs] = await pool.query(
    `SELECT status
     FROM arrangements
     WHERE leave_id = ?`,
    [leaveId]
  );

  const statuses = arrs.map(a => a.status);

  /* CASE A — ANY rejected */
  if (statuses.includes("rejected")) {
    await pool.query(
      `UPDATE leave_requests
       SET final_substitute_status='rejected',
           final_status='rejected',
           hod_status=NULL,
           principal_status=NULL,
           updated_at=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
    return;
  }

  /* CASE B — ALL accepted */
  const allAccepted = statuses.length > 0 && statuses.every(s => s === "accepted");

  if (allAccepted) {
    await pool.query(
      `UPDATE leave_requests
       SET final_substitute_status='accepted',
           hod_status='pending',
           principal_status=NULL,
           updated_at=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
    return;
  }

  /* CASE C — Still pending */
  await pool.query(
    `UPDATE leave_requests
     SET final_substitute_status='pending',
         updated_at=NOW()
     WHERE leave_id = ?`,
    [leaveId]
  );
}

/* ========================================================================
   6) USER LEAVE HISTORY
======================================================================== */
async function getAppliedLeaves(user_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.user_id = ?
     ORDER BY lr.applied_on DESC
     LIMIT 20`,
    [user_id]
  );

  return rows;
}

/* ========================================================================
   7) SUBSTITUTE REQUESTS (New — from arrangements)
======================================================================== */
async function getSubstituteRequests(user_id) {
  const [rows] = await pool.query(
    `SELECT 
        a.arrangement_id,
        a.status AS arrangement_status,
        a.details,
        lr.leave_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.start_session,
        lr.end_session,
        lr.reason,
        u.name AS requester_name
     FROM arrangements a
     JOIN leave_requests lr ON a.leave_id = lr.leave_id
     JOIN users u ON lr.user_id = u.user_id
     WHERE a.substitute_id = ?
     ORDER BY a.arrangement_id DESC`,
    [user_id]
  );

  return rows;
}

/* ========================================================================
   8) GET APPLICANT DETAILS
======================================================================== */
async function getApplicantDetails(leaveId) {
  const [[row]] = await pool.query(
    `SELECT u.user_id, u.name, u.email
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ?
     LIMIT 1`,
    [leaveId]
  );

  return row;
}

/* ========================================================================
   9) GET LEAVE BY ID
======================================================================== */
async function getLeaveById(id) {
  const [[row]] = await pool.query(
    `SELECT *
     FROM leave_requests
     WHERE leave_id = ?
     LIMIT 1`,
    [id]
  );

  return row;
}

/* ========================================================================
   10) HOD — PENDING REQUESTS (ONLY after substitutes accepted)
======================================================================== */
async function getPendingHodRequests(department_code, hod_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.hod_status = 'pending'
       AND lr.final_substitute_status = 'accepted'
       AND u.department_code = ?
       AND lr.user_id != ?
     ORDER BY lr.applied_on DESC`,
    [department_code, hod_id]
  );

  return rows;
}

/* ========================================================================
   11) HOD APPROVAL
======================================================================== */
async function updateHodStatus(leaveId, status) {
  if (status === "approved") {
    await pool.query(
      `UPDATE leave_requests
       SET hod_status='approved',
           principal_status='pending',
           updated_at=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  } else {
    await pool.query(
      `UPDATE leave_requests
       SET hod_status='rejected',
           principal_status='rejected',
           final_status='rejected',
           updated_at=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  }
}

/* ========================================================================
   12) PRINCIPAL APPROVAL
======================================================================== */
async function updatePrincipalStatus(leaveId, status) {
  if (status === "approved") {
    await pool.query(
      `UPDATE leave_requests
       SET principal_status='approved',
           final_status='approved',
           processed_on=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  } else {
    await pool.query(
      `UPDATE leave_requests
       SET principal_status='rejected',
           final_status='rejected',
           processed_on=NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  }
}

/* ========================================================================
   13) HOD — ALL LEAVES OF DEPARTMENT
======================================================================== */
async function getDepartmentLeaves(dept) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE u.department_code = ?
     ORDER BY lr.applied_on DESC  `,
    [dept]
  );

  return rows;
}

async function getLeaveBalance(dept) {
  const [rows] = await pool.query(
    `SELECT 
          u.user_id,
          u.name,
          u.designation,
          lb.casual_total,
          lb.casual_used,
          lb.casual_total - lb.casual_used AS casual_remaining,
          lb.rh_total,
          lb.rh_used,
          lb.rh_total - lb.rh_used AS rh_remaining,
          lb.earned_total,
          lb.earned_used,
          lb.earned_total - lb.earned_used AS earned_remaining
       FROM users u
       LEFT JOIN leave_balance lb ON u.user_id = lb.user_id AND lb.academic_year = YEAR(CURDATE())
       WHERE u.department_code = ?
         AND u.role IN ('faculty', 'hod')
         AND u.is_active = 1
       ORDER BY u.name`,
    [dept]
  );

  return rows;
}

/* ========================================================================
   14) GET DEPARTMENTS
======================================================================== */
async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code
     FROM users
     WHERE role = 'faculty'`
  );

  return rows.map(r => r.department_code);
}

/* ========================================================================
   15) GET ALL INSTITUTION LEAVES
======================================================================== */
async function getInstitutionLeaves(selectedDept = null) {
  let query =
    `SELECT lr.*, u.name AS requester_name, u.department_code
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id`;

  const params = [];

  if (selectedDept) {
    query += ` WHERE u.department_code = ? `;
    params.push(selectedDept);
  }

  query += ` ORDER BY lr.applied_on DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

/* ========================================================================
   EXPORT
======================================================================== */
module.exports = {
  insertLeaveRequest,
  insertArrangement,
  getSubstituteDetails,
  getArrangementsByLeave,
  updateArrangementStatus,
  getAppliedLeaves,
  getSubstituteRequests,
  getApplicantDetails,
  getLeaveById,
  updateHodStatus,
  getLeaveBalance,
  updatePrincipalStatus,
  getDepartmentLeaves,
  getDepartments,
  getPendingHodRequests,
  getInstitutionLeaves
};
