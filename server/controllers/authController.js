const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function login(req, res, next) {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Save user session
    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department_code: user.department_code
    };

    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    return res.json({
      ok: true,
      message: "Login successful",
      user: req.session.user
    });

  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  return res.json({
    ok: true,
    user: req.session.user
  });
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({ ok: true, message: "Logged out" });
  });
}

module.exports = {
  login,
  me,
  logout
};
