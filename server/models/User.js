// models/user.js

const pool = require("../config/db");

/* ============================================================
   GET USER BY USER_ID
============================================================ */
async function getUserById(user_id) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email, phone, role, department_code, password, is_active 
     FROM users 
     WHERE user_id = ? AND is_active = 1
     LIMIT 1`,
    [user_id]
  );
  return rows[0];
}

/* ============================================================
   GET USER BY EMAIL
============================================================ */
async function getUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email, phone, role, department_code 
     FROM users 
     WHERE email = ? 
     LIMIT 1`,
    [email]
  );
  return rows[0];
}

/* ============================================================
   CREATE NEW USER
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

  const [result] = await pool.query(
    `INSERT INTO users 
     (user_id, name, email, phone, role, department_code, designation, date_joined, password, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [user_id, name, email, phone, role, department_code, designation, date_joined, password]
  );

  return result.insertId;
}


/* ============================================================
   UPDATE PASSWORD
============================================================ */
async function updatePassword(user_id, hashedPassword) {
  await pool.query(
    `UPDATE users 
     SET password = ? 
     WHERE user_id = ?`,
    [hashedPassword, user_id]
  );
}

/* ============================================================
   UPDATE PROFILE DETAILS
============================================================ */
async function updateProfile(user_id, data) {
  const { name, email, phone } = data;

  await pool.query(
    `UPDATE users 
     SET name = ?, email = ?, phone = ?
     WHERE user_id = ?`,
    [name, email, phone, user_id]
  );
}

/* ============================================================
   FETCH ALL FACULTY OF DEPARTMENT
============================================================ */
async function getFacultyByDepartment(department_code) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email 
     FROM users 
     WHERE role = 'faculty' AND department_code = ?`,
    [department_code]
  );
  return rows;
}

/* ============================================================
   FETCH SUBSTITUTE DETAILS
============================================================ */
async function getSubstitute(user_id) {
  const [[user]] = await pool.query(
    `SELECT user_id, name, email 
     FROM users 
     WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return user;
}

/* ============================================================
   FETCH ALL DEPARTMENTS (USED BY ADMIN)
============================================================ */
async function getAllDepartments() {
  const [rows] = await pool.query(
    `SELECT DISTINCT department_code 
     FROM users 
     WHERE role = 'faculty'`
  );

  return rows.map((r) => r.department_code);
}

/* ============================================================
   CHECK IF USER EXISTS
============================================================ */
async function userExists(user_id) {
  const [rows] = await pool.query(
    `SELECT user_id FROM users WHERE user_id = ? AND is_active = 1`,
    [user_id]
  );
  return rows.length > 0;
}

/* ============================================================
   CHECK IF EMAIL IS USED
============================================================ */
async function emailExists(email) {
  const [rows] = await pool.query(
    `SELECT email FROM users WHERE email = ?`,
    [email]
  );
  return rows.length > 0;
}

/* ============================================================
   MARK USER ACTIVE / INACTIVE
============================================================ */
async function setActiveStatus(user_id, isActive) {
  await pool.query(
    `UPDATE users SET is_active = ? WHERE user_id = ?`,
    [isActive, user_id]
  );
}

/* ============================================================
   UPDATE LAST LOGIN
============================================================ */
async function updateLastLogin(user_id) {
  await pool.query(
    `UPDATE users 
     SET last_login = NOW() 
     WHERE user_id = ?`,
    [user_id]
  );
}


/* ============================================================
   EXPORT MODEL FUNCTIONS
============================================================ */
module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  updatePassword,
  updateProfile,
  getFacultyByDepartment,
  getSubstitute,
  getAllDepartments,
  userExists,
  emailExists,
  updateLastLogin,
  setActiveStatus
};
