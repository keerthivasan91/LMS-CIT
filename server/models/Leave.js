// models/leave.js
const pool = require("../config/db");

/* ============================================================
   1) INSERT NEW LEAVE REQUEST
============================================================ */
async function insertLeaveRequest(data) {
  const {
    user_id,
    department_code,
    leave_type,
    start_date,
    start_session,
    end_date,
    end_session,
    reason,
    arrangement_details,
    substitute_id
  } = data;

  // Normalize incoming session values: accept "FN"/"AN" or "Forenoon"/"Afternoon"
  function normalizeSession(val) {
    const v = (val || "").toLowerCase();
    if (v.startsWith("f")) return "Forenoon";
    if (v.startsWith("a")) return "Afternoon";
    return "Forenoon"; // fallback
  }

  const startSessionDB = normalizeSession(start_session);
  const endSessionDB = normalizeSession(end_session);

  // Get role of applicant
  const [[user]] = await pool.query(
    `SELECT role FROM users WHERE user_id = ? LIMIT 1`,
    [user_id]
  );

  let substitute_status = null;
  let hod_status = "pending";
  let principal_status = "pending";

  if (user.role === "hod" && !substitute_id) {
    substitute_status = null;
    hod_status = "approved";
    principal_status = "pending";
  } else if (user.role === "hod" && substitute_id) {
    substitute_status = "pending";
    hod_status = "pending";
    principal_status = null;
  } else {
    substitute_status = substitute_id ? "pending" : null;
    hod_status = "pending";
    principal_status = null;
  }

  // Ensure arrangement_details is explicit null if undefined
  const arrDetails = arrangement_details == null ? null : arrangement_details;

  const [result] = await pool.query(
    `INSERT INTO leave_requests
      (user_id, department_code, leave_type, start_date, start_session,
       end_date, end_session, reason, arrangement_details, substitute_id,
       substitute_status, hod_status, principal_status, final_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      user_id,
      department_code,
      leave_type,
      start_date,
      startSessionDB,
      end_date,
      endSessionDB,
      reason,
      arrDetails,
      substitute_id,
      substitute_status,
      hod_status,
      principal_status,
      "pending"
    ]
  );

  return result.insertId;
}



/* ============================================================
   2) INSERT SUBSTITUTE ARRANGEMENT
============================================================ */
async function insertArrangement(leave_id, substitute_id) {
  await pool.query(
    `INSERT INTO arrangements (leave_id, substitute_id, status)
     VALUES (?, ?, 'pending')`,
    [leave_id, substitute_id]
  );
}

/* ============================================================
   3) GET SUBSTITUTE DETAILS
============================================================ */
async function getSubstituteDetails(substitute_id) {
  const [[sub]] = await pool.query(
    `SELECT user_id, name, email 
     FROM users 
     WHERE user_id = ? LIMIT 1`,
    [substitute_id]
  );
  return sub;
}

/* ============================================================
   4) APPLIED LEAVES (USER HISTORY)
============================================================ */
async function getAppliedLeaves(user_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, s.name AS substitute_name
     FROM leave_requests lr
     LEFT JOIN users s ON lr.substitute_id = s.user_id
     WHERE lr.user_id = ?
     ORDER BY lr.applied_on DESC
     LIMIT 20`,
    [user_id]
  );
  return rows;
}

/* ============================================================
   5) SUBSTITUTE REQUESTS FOR USER
============================================================ */
async function getSubstituteRequests(user_id) {
  const [rows] = await pool.query(
    `SELECT 
        lr.leave_id,
        lr.user_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.days,
        lr.reason,
        lr.arrangement_details,
        lr.substitute_status,
        u.name AS requester_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.substitute_id = ?
     ORDER BY lr.leave_id DESC
     LIMIT 20`,
    [user_id]
  );
  return rows;
}

/* ============================================================
   6) GET LEAVE APPLICANT (for email)
============================================================ */
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

/* ============================================================
   7) GET SINGLE LEAVE REQUEST
============================================================ */
async function getLeaveById(leaveId) {
  const [[row]] = await pool.query(
    `SELECT * FROM leave_requests WHERE leave_id = ? LIMIT 1`,
    [leaveId]
  );
  return row;
}

/* ============================================================
   8) SUBSTITUTE APPROVE / REJECT
============================================================ */
async function updateSubstituteStatus(leaveId, status) {
  await pool.query(
    `UPDATE leave_requests 
     SET substitute_status = ?
     WHERE leave_id = ?`,
    [status, leaveId]
  );
}

/* ============================================================
   9) HOD APPROVE / REJECT
      Maps to: approved / rejected / pending
============================================================ */
async function updateHodStatus(leaveId, status) {
  if (status === "approved") {
    await pool.query(
      `UPDATE leave_requests 
       SET hod_status = 'approved',
           principal_status = 'pending',
           final_status = 'pending',
           updated_at = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  } else {
    await pool.query(
      `UPDATE leave_requests 
       SET hod_status = 'rejected',
           principal_status = 'rejected',
           final_status = 'rejected',
           updated_at = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  }
}

/* ============================================================
   HOD – GET PENDING REQUESTS
============================================================ */
async function getPendingHodRequests(department_code, hod_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name 
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.hod_status = 'pending'
       AND (lr.substitute_status = 'accepted' OR lr.substitute_status IS NULL)
       AND u.department_code = ?
       AND lr.user_id != ?`,
    [department_code, hod_id]
  );
  return rows;
}


/* ============================================================
   HOD – APPROVE LEAVE (simple version for Jest tests)
============================================================ */
async function approveLeave(leave_id) {
  const [result] = await pool.query(
    `UPDATE leave_requests
     SET hod_status = 'approved'
     WHERE leave_id = ?`,
    [leave_id]
  );
  return result;
}


/* ============================================================
   10) PRINCIPAL APPROVE / REJECT
============================================================ */
async function updatePrincipalStatus(leaveId, status) {
  const [[leave]] = await pool.query(
    `SELECT user_id, leave_type, days
     FROM leave_requests
     WHERE leave_id = ?
     LIMIT 1`,
    [leaveId]
  );

  const leaveTypeMap = {
    "Casual Leave": "casual",
    "Earned Leave": "earned",
    "Restricted Holiday": "rh"
  };

  const academicYear = new Date().getFullYear();

  if (status === "approved") {

    await pool.query(
      `UPDATE leave_requests
       SET principal_status = 'approved',
           final_status = 'approved',
           processed_on = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );

    const typeKey = leaveTypeMap[leave.leave_type];

    if (typeKey) {
      const result = await pool.query(
        `UPDATE leave_balance
         SET ${typeKey}_used  = ${typeKey}_used + ?,
             ${typeKey}_total = ${typeKey}_total - ?
         WHERE user_id = ? AND academic_year = ?`,
        [leave.days, leave.days, leave.user_id, academicYear]
      );
      console.log("Update Result:", result);
    }
    console.log("Running updatePrincipalStatus for:", leave.user_id, leave.days, leave.leave_type);
    console.log("TypeKey:", typeKey);

  } else {

    await pool.query(
      `UPDATE leave_requests
       SET principal_status = 'rejected',
           final_status = 'rejected',
           processed_on = NOW()
       WHERE leave_id = ?`,
      [leaveId]
    );
  }
}





/* ============================================================
   11) HOD DEPARTMENT LEAVES
============================================================ */
async function getLeaveBalance(department_code) {
  // 1. Get department faculty + staff (hod, faculty, admin, principal included if needed)
  const [users] = await pool.query(
    `SELECT user_id, name, role
     FROM users
     WHERE department_code = ? AND is_active = 1`,
    [department_code]
  );

  const academicYear = new Date().getFullYear();
  const result = [];

  // 2. Loop through each user and get their leave balance
  for (const user of users) {
    const [bal] = await pool.query(
      `SELECT *
       FROM leave_balance
       WHERE user_id = ? AND academic_year = ? 
       LIMIT 1`,
      [user.user_id, academicYear]
    );

    // If no leave balance row exists, send zeros
    const balance = bal[0] || {
      casual_total: 0, casual_used: 0,
      sick_total: 0, sick_used: 0,
      earned_total: 0, earned_used: 0,
      comp_total: 0, comp_used: 0,
    };

    result.push({
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      academic_year: academicYear,

      casual_total: balance.casual_total,
      casual_used: balance.casual_used,
      casual_remaining: balance.casual_total - balance.casual_used,

      sick_total: balance.sick_total,
      sick_used: balance.sick_used,
      sick_remaining: balance.sick_total - balance.sick_used,

      earned_total: balance.earned_total,
      earned_used: balance.earned_used,
      earned_remaining: balance.earned_total - balance.earned_used,

      comp_total: balance.comp_total,
      comp_used: balance.comp_used,
      comp_remaining: balance.comp_total - balance.comp_used
    });
  }

  return result;
}

async function getDepartmentLeaves(department_code) {
  const [rows] = await pool.query(
    `SELECT lr.*, 
            u1.name AS requester_name,
            u2.name AS substitute_name
     FROM leave_requests lr
     LEFT JOIN users u1 ON lr.user_id = u1.user_id
     LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
     WHERE u1.department_code = ?
     ORDER BY lr.applied_on DESC`,
    [department_code]
  );
  return rows;
}




/* ============================================================
   12) ALL DEPARTMENTS
============================================================ */
async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code 
     FROM users 
     WHERE role = 'faculty'`
  );
  return rows.map((d) => d.department_code);
}

/* ============================================================
   13) INSTITUTION LEAVES (ADMIN/PRINCIPAL)
============================================================ */
async function getInstitutionLeaves(selected_department = null) {
  let query = `
    SELECT lr.*, 
           u1.name AS requester_name,
           u2.name AS substitute_name,
           u1.department_code
    FROM leave_requests lr
    LEFT JOIN users u1 ON lr.user_id = u1.user_id
    LEFT JOIN users u2 ON lr.substitute_id = u2.user_id`;
  const params = [];

  if (selected_department) {
    query += ` WHERE u1.department_code = ? `;
    params.push(selected_department);
  }

  query += ` ORDER BY lr.applied_on DESC `;

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getLeaveApplicant(leaveId) {
  return await getApplicantDetails(leaveId);
}


/* ============================================================
   EXPORT
============================================================ */
module.exports = {
  insertLeaveRequest,
  insertArrangement,
  getSubstituteDetails,
  getAppliedLeaves,
  getSubstituteRequests,
  getApplicantDetails,
  getLeaveById,
  updateSubstituteStatus,
  updateHodStatus,
  updatePrincipalStatus,
  getLeaveBalance,
  getDepartmentLeaves,
  getDepartments,
  getInstitutionLeaves,
  getPendingHodRequests,
  getLeaveApplicant,
  approveLeave
};
