// controllers/authController.js

const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");

/* ============================================================
   LOGIN (SESSION BASED)
============================================================ */
async function login(req, res, next) {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Store session
    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department_code: user.department_code,
    };

    await UserModel.updateLastLogin(user.user_id);

    res.json({
      ok: true,
      message: "Login successful",
      user: req.session.user,
    });

  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GET LOGGED IN USER
============================================================ */
async function me(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  return res.json({ ok: true, user: req.session.user });
}

/* ============================================================
   LOGOUT
============================================================ */
async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({ ok: true, message: "Logged out" });
  });
}

module.exports = {
  login,
  me,
  logout,
};
