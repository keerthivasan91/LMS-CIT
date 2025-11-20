const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function changePassword(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const old_password = req.body.current_password;  // FIXED
    const { new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ message: "Both fields required" });
    }

    const [[user]] = await pool.query(
      "SELECT password FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(old_password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?",
      [hashed, user_id]
    );

    return res.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { changePassword };
