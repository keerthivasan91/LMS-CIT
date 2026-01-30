// models/user.js

const pool = require("../config/db");

/* ============================================================
   GET USER (AUTH / SESSION)
============================================================ */
async function getUserById(user_id) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, phone, role, department_code, password, is_active
     FROM users
     WHERE user_id = ?
     LIMIT 1`,
    [user_id]
  );
  return row;
}

/* ============================================================
   GET USER BY EMAIL
============================================================ */
async function getUserByEmail(email) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, phone, role, department_code, is_active
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return row;
}

/* ============================================================
   CREATE USER (NO LEAVE LOGIC HERE)
============================================================ */
async function createUser(data) {
  const {
    user_id,
    name,
    email,
    phone,
    role,
    department_code,
    designation,
    date_joined,
    password
  } = data;

  await pool.query(
    `INSERT INTO users
     (user_id, name, email, phone, role, department_code,
      designation, date_joined, password, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      user_id,
      name,
      email,
      phone,
      role,
      department_code,
      designation,
      date_joined,
      password
    ]
  );

  return user_id;
}

/* ============================================================
   PASSWORD / PROFILE
============================================================ */
async function updatePassword(user_id, hashedPassword) {
  await pool.query(
    `UPDATE users SET password = ? WHERE user_id = ?`,
    [hashedPassword, user_id]
  );
}

async function updateProfile(user_id, { name, email, phone }) {
  await pool.query(
    `UPDATE users
     SET name = ?, email = ?, phone = ?
     WHERE user_id = ?`,
    [name, email, phone, user_id]
  );
}

/* ============================================================
   ROLE & POLICY HELPERS (IMPORTANT)
============================================================ */
async function getUserRole(user_id) {
  const [[row]] = await pool.query(
    `SELECT role FROM users WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return row?.role || null;
}

async function getUserDepartment(user_id) {
  const [[row]] = await pool.query(
    `SELECT department_code FROM users WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return row?.department_code || null;
}

/* ============================================================
   FACULTY / STAFF LOOKUPS
============================================================ */
async function getFacultyByDepartment(department_code) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email
     FROM users
     WHERE department_code = ?
       AND role IN ('faculty', 'hod')
       AND is_active = 1
     ORDER BY name`,
    [department_code]
  );
  return rows;
}

async function getStaffByDepartment(department_code) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email
     FROM users
     WHERE department_code = ?
       AND role IN ('staff', 'admin')
       AND is_active = 1
     ORDER BY name`,
    [department_code]
  );
  return rows;
}

/* ============================================================
   SUBSTITUTE LOOKUP
============================================================ */
async function getSubstitute(user_id) {
  const [[row]] = await pool.query(
    `SELECT user_id, name, email, role, department_code
     FROM users
     WHERE user_id = ? AND is_active = 1
     LIMIT 1`,
    [user_id]
  );
  return row;
}

/* ============================================================
   ADMIN UTILITIES
============================================================ */
async function getAllDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code
     FROM users
     WHERE department_code IS NOT NULL
       AND is_active = 1
     ORDER BY department_code`
  );
  return rows.map(r => r.department_code);
}

async function userExists(user_id) {
  const [[row]] = await pool.query(
    `SELECT 1 FROM users WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return !!row;
}

async function emailExists(email) {
  const [[row]] = await pool.query(
    `SELECT 1 FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return !!row;
}

async function setActiveStatus(user_id, isActive) {
  await pool.query(
    `UPDATE users SET is_active = ? WHERE user_id = ?`,
    [isActive, user_id]
  );
}

async function updateLastLogin(user_id) {
  await pool.query(
    `UPDATE users SET last_login = NOW() WHERE user_id = ?`,
    [user_id]
  );
}

/* ============================================================
   REACTIVATE USER
============================================================ */
async function reactivateUser(user_id, data) {
  const {
    name,
    email,
    phone,
    role,
    department_code,
    designation,
    date_joined,
    password
  } = data;

  await pool.query(
    `UPDATE users
     SET name = ?, email = ?, phone = ?, role = ?, department_code = ?,
         designation = ?, date_joined = ?, password = ?, is_active = 1
     WHERE user_id = ?`,
    [
      name,
      email,
      phone,
      role,
      department_code,
      designation,
      date_joined,
      password,
      user_id
    ]
  );
}

async function getUserFull(user_id) {
  const [[row]] = await pool.query(
    `SELECT * FROM users WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return row;
}

/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  updatePassword,
  updateProfile,

  getUserRole,
  getUserDepartment,

  getFacultyByDepartment,
  getStaffByDepartment,
  getSubstitute,

  getAllDepartments,
  userExists,
  emailExists,

  updateLastLogin,
  reactivateUser,
  getUserFull,
  setActiveStatus
};
