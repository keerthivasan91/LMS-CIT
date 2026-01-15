// models/profile.js

const pool = require("../config/db");

/* ============================================================
   FETCH PROFILE STATS
============================================================ */
async function getProfileStatsModel(user_id) {
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

  return rows[0] || {};
}

/* ============================================================
   GET CURRENT HASHED PASSWORD
============================================================ */
async function getUserPassword(user_id) {
  const [rows] = await pool.query(
    `SELECT password FROM users WHERE user_id = ? AND is_active = 1`,
    [user_id]
  );
  return rows[0];
}

/* ============================================================
   UPDATE PASSWORD
============================================================ */
async function updateUserPassword(user_id, hashedPassword) {
  await pool.query(
    `UPDATE users 
     SET password = ?, updated_at = NOW() 
     WHERE user_id = ?`,
    [hashedPassword, user_id]
  );
}

async function getLeaveBalanceModel(user_id) {
  const [rows] = await pool.query(
    `SELECT (casual_total - casual_used) AS casual_remaining,
            (earned_total - earned_used) AS earned_remaining,
            (rh_total - rh_used) AS rh_remaining
     FROM leave_balance 
     WHERE user_id = ?`,
    [user_id]
  );
  return rows[0] || { casual_used: 0, earned_used: 0, rh_used: 0 };
}


module.exports = {
  getProfileStatsModel,
  getUserPassword,
  updateUserPassword,
  getLeaveBalanceModel
};
