// models/Admin.js
const pool = require("../config/db");

/* ============================================================
   PRINCIPAL PENDING
============================================================ */
async function getPrincipalPending() {
  const [rows] = await pool.query(`
    SELECT lr.*, u.name AS requester_name, u.department_code AS dept
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    WHERE lr.hod_status='approved'
      AND lr.principal_status='pending'
      AND lr.final_status='pending'
    ORDER BY lr.applied_on DESC
  `);
  return rows;
}

/* ============================================================
   INSTITUTION LEAVES
============================================================ */
async function getInstitutionLeaves(department = null) {
  let sql = `
    SELECT lr.*, u.name AS requester_name, d.department_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    LEFT JOIN departments d ON lr.department_code = d.department_code
  `;
  const params = [];

  if (department) {
    sql += ` WHERE lr.department_code = ?`;
    params.push(department);
  }

  sql += ` ORDER BY lr.applied_on DESC`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

/* ============================================================
   USERS (PAGINATED)
============================================================ */
async function getUsers({ search, department, limit, offset }) {
  let where = "WHERE u.is_active=1";
  const params = [];

  if (search) {
    where += " AND (u.name LIKE ? OR u.email LIKE ? OR u.user_id LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (department) {
    where += " AND u.department_code=?";
    params.push(department);
  }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) total FROM users u ${where}`,
    params
  );

  const [users] = await pool.query(
    `SELECT u.user_id,u.name,u.email,u.role,u.department_code,u.designation,
            d.department_name
     FROM users u
     LEFT JOIN departments d ON u.department_code=d.department_code
     ${where}
     ORDER BY u.department_code,u.role,u.name
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { users, total };
}

/* ============================================================
   USER PROFILE
============================================================ */
async function getUserProfileById(user_id) {
  const [[row]] = await pool.query(`
    SELECT u.*, d.department_name,
           lb.casual_total, lb.casual_used,
           lb.earned_total, lb.earned_used,
           lb.rh_total, lb.rh_used
    FROM users u
    LEFT JOIN departments d ON u.department_code=d.department_code
    LEFT JOIN leave_balance lb 
      ON u.user_id=lb.user_id AND lb.academic_year=YEAR(CURDATE())
    WHERE u.user_id=? LIMIT 1
  `, [user_id]);

  return row;
}

/* ============================================================
   BASIC USER OPS
============================================================ */
async function getUserById(user_id) {
  const [[row]] = await pool.query(
    `SELECT user_id,name,email,role,department_code,designation
     FROM users WHERE user_id=? LIMIT 1`,
    [user_id]
  );
  return row;
}

async function deleteUser(user_id) {
  const [res] = await pool.query(
    `UPDATE users SET is_active=0 WHERE user_id=?`,
    [user_id]
  );
  return res.affectedRows > 0;
}

/* ============================================================
   PASSWORD RESET
============================================================ */
async function getPendingPasswordResets() {
  const [rows] = await pool.query(`
    SELECT prr.*, u.name,u.role,u.department_code
    FROM password_reset_requests prr
    JOIN users u ON prr.user_id=u.user_id
    WHERE prr.status='pending'
    ORDER BY prr.created_at DESC
  `);
  return rows;
}

async function resetPasswordAndResolve(user_id, hashedPassword) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE users SET password=? WHERE user_id=?`,
      [hashedPassword, user_id]);
    await conn.query(
      `UPDATE password_reset_requests SET status='resolved', resolved_at=NOW()
       WHERE user_id=? AND status='pending'`,
      [user_id]
    );
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ============================================================
   SUPPORT
============================================================ */
async function getApplicantEmail(leave_id) {
  const [[row]] = await pool.query(`
    SELECT u.email,u.name
    FROM leave_requests lr
    JOIN users u ON lr.user_id=u.user_id
    WHERE lr.leave_id=? LIMIT 1
  `, [leave_id]);
  return row;
}

async function getDepartments() {
  const [rows] = await pool.query(
    `SELECT department_code,department_name
     FROM departments WHERE is_active=1`
  );
  return rows;
}

/* ============================================================
   PRINCIPAL APPROVAL (TRANSACTION SAFE)
============================================================ */
async function approveLeavePrincipalTx(conn, leave_id) {
  await conn.query(
    `UPDATE leave_requests
     SET principal_status = 'approved',
         final_status = 'approved',
         processed_on = NOW()
     WHERE leave_id = ?`,
    [leave_id]
  );
}

/* ============================================================
   PRINCIPAL REJECT
============================================================ */
async function rejectLeavePrincipal(leave_id) {
  await pool.query(
    `UPDATE leave_requests
     SET principal_status = 'rejected',
         final_status = 'rejected',
         processed_on = NOW()
     WHERE leave_id = ?`,
    [leave_id]
  );
}


/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  getPrincipalPending,
  getInstitutionLeaves,
  getUsers,
  getUserProfileById,
  getUserById,
  deleteUser,
  getApplicantEmail,
  getPendingPasswordResets,
  resetPasswordAndResolve,
  getDepartments,
  approveLeavePrincipalTx,
  rejectLeavePrincipal
};
