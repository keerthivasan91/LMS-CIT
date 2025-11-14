const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * LOGIN CONTROLLER
 */
async function login(req, res, next) {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

    // Schema-correct: department_code instead of department
    const [rows] = await pool.query(
      `SELECT 
         user_id, password, role, name, email, phone, department_code
       FROM users 
       WHERE user_id = ? AND is_active = 1 
       LIMIT 1`,
      [user_id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT Payload
    const payload = {
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department_code: user.department_code
    };

    // Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    // Update last login timestamp
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    res.json({
      ok: true,
      token,
      user: payload
    });

  } catch (err) {
    next(err);
  }
}

/**
 * AUTHENTICATED USER DETAILS
 */
async function me(req, res, next) {
  try {
    return res.json({
      ok: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  me
};
