const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/* ---------------------------------------------------------
   GET PROFILE STATISTICS
--------------------------------------------------------- */
async function getProfileStats(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
          COUNT(*) AS total,
          SUM(final_status = 'approved') AS approved,
          SUM(final_status = 'rejected') AS rejected,
          SUM(final_status = 'pending') AS pending,
          COALESCE(SUM(days), 0) AS total_days
       FROM leave_requests 
       WHERE user_id = ?`,
      [user_id]
    );

    res.json({ ok: true, stats: rows[0] || {} });

  } catch (err) {
    next(err);
  }
}

/* ---------------------------------------------------------
   CHANGE PASSWORD
--------------------------------------------------------- */
async function changePassword(req, res, next) {
  try {
    const user_id = req.user.user_id;
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Fetch stored hashed password
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE user_id = ? AND is_active = 1",
      [user_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const storedPassword = rows[0].password;

    // Validate current password
    const isMatch = await bcrypt.compare(current_password, storedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash updated password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?",
      [hashedPassword, user_id]
    );

    res.json({ ok: true, message: "Password changed successfully" });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfileStats,
  changePassword,
};
