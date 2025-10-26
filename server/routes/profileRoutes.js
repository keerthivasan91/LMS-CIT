const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get user profile stats
router.get('/stats', async (req, res) => {
  try {
    const user_id = req.session.user_id;
    
    const [stats] = await db.execute(
      `SELECT
          COUNT(*) AS total,
          SUM(final_status='Approved') AS approved,
          SUM(final_status='Rejected') AS rejected,
          SUM(final_status='Pending') AS pending,
          SUM(days) AS total_days
       FROM leave_requests WHERE user_id=?`,
      [user_id]
    );

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({ error: "Failed to fetch profile stats" });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const user_id = req.session.user_id;

    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    const [users] = await db.execute(
      "SELECT password FROM users WHERE user_id=?",
      [user_id]
    );

    if (users.length === 0 || users[0].password !== current_password) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    await db.execute(
      "UPDATE users SET password=? WHERE user_id=?",
      [new_password, user_id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Get holidays
router.get('/holidays', async (req, res) => {
  try {
    const [holidays] = await db.execute(
      "SELECT id, date, name FROM holidays ORDER BY date"
    );

    res.json({ holidays });
  } catch (error) {
    console.error('Holidays error:', error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

module.exports = router;