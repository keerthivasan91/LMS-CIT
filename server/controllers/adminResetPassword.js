const bcrypt = require("bcryptjs");
const pool = require("../config/db");

/* ===========================================================
   1) FETCH ALL PASSWORD RESET REQUESTS (pending only)
=========================================================== */
async function getResetRequests(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, email, created_at 
       FROM password_reset_requests 
       WHERE status = 'pending'
       ORDER BY created_at DESC`
    );

    return res.json({ requests: rows });

  } catch (err) {
    next(err);
  }
}

/* ===========================================================
   2) ADMIN RESETS PASSWORD (admin enters new password)
=========================================================== */
async function adminResetPasswordFinal(req, res, next) {
  try {
    const { user_id, new_password } = req.body;

    if (!user_id || !new_password) {
      return res
        .status(400)
        .json({ message: "user_id and new_password are required" });
    }

    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if request exists & is pending
    const [reqRow] = await pool.query(
      `SELECT email FROM password_reset_requests 
       WHERE user_id = ? AND status = 'pending'`,
      [user_id]
    );

    if (reqRow.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending password reset request found" });
    }

    const email = reqRow[0].email;

    // Hash password
    const hashed = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      `UPDATE users SET password = ? WHERE user_id = ?`,
      [hashed, user_id]
    );

    // Mark request resolved
    await pool.query(
      `UPDATE password_reset_requests 
       SET status='resolved', resolved_at=NOW() 
       WHERE user_id = ?`,
      [user_id]
    );

    return res.json({
      ok: true,
      message: `Password updated for ${user_id}`
    });

  } catch (err) {
    next(err);
  }
}

/* ===========================================================
   EXPORT BOTH FUNCTIONS
=========================================================== */
module.exports = {
  getResetRequests,
  adminResetPasswordFinal,
};
