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

  let final_substitute_status = "pending";
  let hod_status = "pending";
  let principal_status = "pending";
  let final_status = "pending";

  // ✅ ONLY condition for substitute auto-accept
  if (!hasSubstitutes) {
    final_substitute_status = "accepted";
  }

  // HOD applying → skip HOD stage
  if (userRole === "hod") {
    hod_status = "approved";
  }

  // Principal applying → skip HOD & Principal stages
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
    `SELECT user_id, name, email, department_code, role
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
    `SELECT a.*, u.name as substitute_name, u.email as substitute_email
     FROM arrangements a
     LEFT JOIN users u ON a.substitute_id = u.user_id
     WHERE a.leave_id = ?
     ORDER BY a.arrangement_id ASC`,
    [leaveId]
  );

  return rows;
}


/* ========================================================================
   6) USER LEAVE HISTORY
======================================================================== */
async function getAppliedLeaves(user_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name,
            COUNT(DISTINCT a.arrangement_id) as arrangement_count,
            SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
     WHERE lr.user_id = ?
     GROUP BY lr.leave_id
     ORDER BY lr.applied_on DESC
     LIMIT 20`,
    [user_id]
  );

  return rows;
}

/* ========================================================================
   7) SUBSTITUTE REQUESTS
======================================================================== */
async function getSubstituteRequests(user_id) {
  const [rows] = await pool.query(
    `SELECT 
        a.arrangement_id,
        a.status AS arrangement_status,
        a.details,
        a.responded_on,
        lr.leave_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.start_session,
        lr.end_session,
        lr.reason,
        lr.final_substitute_status,
        u.name AS requester_name,
        u.email AS requester_email,
        u.phone AS requester_phone
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
    `SELECT u.user_id, u.name, u.email, u.department_code, u.role
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ?
     LIMIT 1`,
    [leaveId]
  );

  return row;
}

/* ========================================================================
   9) GET LEAVE BY ID WITH DETAILS
======================================================================== */
async function getLeaveById(id) {
  const [[row]] = await pool.query(
    `SELECT lr.*, 
            u.name as requester_name,
            u.email as requester_email,
            u.department_code as requester_dept,
            u.role as requester_role
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.leave_id = ?
     LIMIT 1`,
    [id]
  );

  return row;
}

/* ========================================================================
   10) HOD — PENDING REQUESTS
======================================================================== */
async function getPendingHodRequests(department_code, hod_id) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name, u.designation,
            COUNT(DISTINCT a.arrangement_id) as total_arrangements,
            SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted_arrangements
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     LEFT JOIN arrangements a ON lr.leave_id = a.leave_id
     WHERE lr.hod_status = 'pending'
       AND lr.final_substitute_status = 'accepted'
       AND u.department_code = ?
       AND lr.user_id != ?
     GROUP BY lr.leave_id
     ORDER BY lr.applied_on DESC`,
    [department_code, hod_id]
  );

  return rows;
}

/* ========================================================================
   11) HOD APPROVAL
======================================================================== */
async function updateHodStatus(leaveId, status) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    if (status === "approved") {
      await conn.query(
        `UPDATE leave_requests
         SET hod_status = 'approved',
             principal_status = 'pending',
             updated_at = NOW()
         WHERE leave_id = ?`,
        [leaveId]
      );
    } else {
      await conn.query(
        `UPDATE leave_requests
         SET hod_status = 'rejected',
             principal_status = 'rejected',
             final_status = 'rejected',
             updated_at = NOW()
         WHERE leave_id = ?`,
        [leaveId]
      );
    }

    await conn.commit();
    return { success: true };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/* ========================================================================
   12) PRINCIPAL APPROVAL
======================================================================== */
async function updatePrincipalStatus(leaveId, status) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    if (status === "approved") {
      await conn.query(
        `UPDATE leave_requests
         SET principal_status = 'approved',
             final_status = 'approved',
             processed_on = NOW(),
             updated_at = NOW()
         WHERE leave_id = ?`,
        [leaveId]
      );

      // Update leave balance if needed
      const [[leave]] = await conn.query(
        `SELECT user_id, leave_type FROM leave_requests WHERE leave_id = ?`,
        [leaveId]
      );

      if (leave.leave_type) {
        // Calculate days
        const [[days]] = await conn.query(
          `SELECT 
            CASE 
              WHEN start_date = end_date AND start_session = 'Full' AND end_session = 'Full' THEN 1
              WHEN start_date = end_date AND start_session != end_session THEN 0.5
              WHEN start_date != end_date THEN 
                DATEDIFF(end_date, start_date) + 1
              ELSE 1
            END as total_days
           FROM leave_requests WHERE leave_id = ?`,
          [leaveId]
        );

        const totalDays = days.total_days || 0;

        // Update leave balance
        if (totalDays > 0) {
          const leaveTypeMap = {
            'Casual Leave': 'casual',
            'Earned Leave': 'earned',
            'RH': 'rh',
            'Optional Holiday': 'optional'
          };

          const field = leaveTypeMap[leave.leave_type] || 'casual';
          const usedField = `${field}_used`;

          await conn.query(
            `INSERT INTO leave_balance 
             (user_id, academic_year, ${usedField})
             VALUES (?, YEAR(CURDATE()), ?)
             ON DUPLICATE KEY UPDATE
             ${usedField} = ${usedField} + ?`,
            [leave.user_id, totalDays, totalDays]
          );
        }
      }

    } else {
      await conn.query(
        `UPDATE leave_requests
         SET principal_status = 'rejected',
             final_status = 'rejected',
             processed_on = NOW(),
             updated_at = NOW()
         WHERE leave_id = ?`,
        [leaveId]
      );
    }

    await conn.commit();
    return { success: true };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/* ========================================================================
   13) HOD — ALL LEAVES OF DEPARTMENT
======================================================================== */
async function getDepartmentLeaves(dept) {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name, u.designation,
            (SELECT COUNT(*) FROM arrangements WHERE leave_id = lr.leave_id) as arrangement_count
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE u.department_code = ?
     ORDER BY lr.applied_on DESC`,
    [dept]
  );

  return rows;
}

/* ========================================================================
   14) GET LEAVE BALANCE
======================================================================== */
async function getLeaveBalance(dept) {
  const [rows] = await pool.query(
    `SELECT 
          u.user_id,
          u.name,
          u.designation,
          COALESCE(lb.casual_total, 12) as casual_total,
          COALESCE(lb.casual_used, 0) as casual_used,
          COALESCE(lb.casual_total, 12) - COALESCE(lb.casual_used, 0) as casual_remaining,
          COALESCE(lb.rh_total, 2) as rh_total,
          COALESCE(lb.rh_used, 0) as rh_used,
          COALESCE(lb.rh_total, 2) - COALESCE(lb.rh_used, 0) as rh_remaining,
          COALESCE(lb.earned_total, 15) as earned_total,
          COALESCE(lb.earned_used, 0) as earned_used,
          COALESCE(lb.earned_total, 15) - COALESCE(lb.earned_used, 0) as earned_remaining,
          COALESCE(lb.vacation_total, 30) as vacation_total,
          COALESCE(lb.vacation_used, 0) as vacation_used,
          COALESCE(lb.vacation_total, 30) - COALESCE(lb.vacation_used, 0) as vacation_remaining
       FROM users u
       LEFT JOIN leave_balance lb ON u.user_id = lb.user_id AND lb.academic_year = YEAR(CURDATE())
       WHERE u.department_code = ?
         AND u.role IN ('faculty', 'hod', 'staff', 'admin')
         AND u.is_active = 1
       ORDER BY u.name`,
    [dept]
  );

  return rows;
}

/* ========================================================================
   15) GET DEPARTMENTS
======================================================================== */
async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code as code
     FROM users
     WHERE role IN ('faculty', 'hod', 'staff', 'admin')
     ORDER BY department_code`
  );

  return rows;
}

/* ========================================================================
   16) GET ALL INSTITUTION LEAVES
======================================================================== */
async function getInstitutionLeaves(selectedDept = null) {
  let query = `
    SELECT lr.*, 
           u.name AS requester_name, 
           u.department_code,
           (SELECT COUNT(*) FROM arrangements WHERE leave_id = lr.leave_id) as arrangement_count
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
  `;

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
   17) GET STAFF BY DEPARTMENT
======================================================================== */
async function getStaffByDepartment(dept) {
  const [rows] = await pool.query(
    `SELECT user_id, name, designation, email
     FROM users
     WHERE department_code = ? 
       AND (role = 'staff' OR role = 'admin')
       AND is_active = 1
     ORDER BY name`,
    [dept]
  );

  return rows;
}

/* ========================================================================
   18) GET FACULTY BY DEPARTMENT
======================================================================== */
async function getFacultyByDepartment(dept) {
  const [rows] = await pool.query(
    `SELECT user_id, name, designation, email
     FROM users
     WHERE department_code = ? 
       AND role IN ('faculty', 'hod')
       AND is_active = 1
     ORDER BY name`,
    [dept]
  );

  return rows;
}

/* ========================================================================
   19) GET PRINCIPAL PENDING REQUESTS
======================================================================== */
async function getPendingPrincipalRequests() {
  const [rows] = await pool.query(
    `SELECT lr.*, u.name AS requester_name,
            u.department_code as dept
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.user_id
     WHERE lr.principal_status = 'pending'
       AND lr.hod_status = 'approved'
       AND lr.final_status = 'pending'
     ORDER BY lr.applied_on DESC`
  );

  return rows;
}

/* ========================================================================
   20) GET LEAVE STATISTICS
======================================================================== */
async function getLeaveStatistics(dept = null) {
  let whereClause = "";
  const params = [];

  if (dept) {
    whereClause = "WHERE u.department_code = ?";
    params.push(dept);
  }

  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) as total_leaves,
      SUM(CASE WHEN final_status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN final_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN final_status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN leave_type = 'Casual Leave' THEN 1 ELSE 0 END) as casual,
      SUM(CASE WHEN leave_type = 'Earned Leave' THEN 1 ELSE 0 END) as earned,
      SUM(CASE WHEN leave_type = 'RH' THEN 1 ELSE 0 END) as rh,
      SUM(CASE WHEN leave_type = 'Optional Holiday' THEN 1 ELSE 0 END) as optional
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    ${whereClause}
  `, params);

  return rows[0] || {};
}

/* ========================================================================
   21) GET USER'S LEAVE BALANCE
======================================================================== */
async function getUserLeaveBalance(user_id) {
  const [[row]] = await pool.query(
    `SELECT 
          COALESCE(lb.casual_total, 12) as casual_total,
          COALESCE(lb.casual_used, 0) as casual_used,
          COALESCE(lb.rh_total, 2) as rh_total,
          COALESCE(lb.rh_used, 0) as rh_used,
          COALESCE(lb.earned_total, 15) as earned_total,
          COALESCE(lb.earned_used, 0) as earned_used
     FROM leave_balance lb
     WHERE lb.user_id = ? AND lb.academic_year = YEAR(CURDATE())`,
    [user_id]
  );

  return row || {
    casual_total: 12,
    casual_used: 0,
    rh_total: 2,
    rh_used: 0,
    earned_total: 15,
    earned_used: 0
  };
}

/* ========================================================================
   EXPORT
======================================================================== */
module.exports = {
  insertLeaveRequest,
  insertArrangement,
  getSubstituteDetails,
  getArrangementsByLeave,
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
  getInstitutionLeaves,
  getStaffByDepartment,
  getFacultyByDepartment,
  getPendingPrincipalRequests,
  getLeaveStatistics,
  getUserLeaveBalance,
  normalizeSession
};