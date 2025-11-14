const pool = require("../config/db");

/* -----------------------------------------------------------
   GET NOTIFICATIONS FOR LOGGED-IN USER
----------------------------------------------------------- */
async function getNotifications(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
          notification_id,
          sender_id,
          message,
          type,
          status,
          related_leave_id,
          created_at
       FROM notifications
       WHERE receiver_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [user_id]
    );

    res.json({ ok: true, notifications: rows });
  } catch (err) {
    next(err);
  }
}

/* -----------------------------------------------------------
   MARK ONE NOTIFICATION AS READ
----------------------------------------------------------- */
async function markAsRead(req, res, next) {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params; // notification_id

    await pool.query(
      `UPDATE notifications
       SET status = 'read'
       WHERE notification_id = ? AND receiver_id = ?`,
      [id, user_id]
    );

    res.json({ ok: true, message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
}

/* -----------------------------------------------------------
   MARK ALL NOTIFICATIONS AS READ
----------------------------------------------------------- */
async function markAllAsRead(req, res, next) {
  try {
    const user_id = req.user.user_id;

    await pool.query(
      `UPDATE notifications
       SET status = 'read'
       WHERE receiver_id = ?`,
      [user_id]
    );

    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
