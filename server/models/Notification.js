const db = require('../config/db');

class Notification {
  static async create(notificationData) {
    const { user_id, type, title, message, related_id } = notificationData;
    
    const [result] = await db.execute(
      "INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)",
      [user_id, type, title, message, related_id]
    );
    
    return result.insertId;
  }

  static async findByUserId(userId, limit = 20) {
    const [rows] = await db.execute(
      "SELECT id, type, title, message, related_id, created_at, is_read FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      [userId, limit]
    );
    return rows;
  }

  static async markAsRead(notificationId) {
    const [result] = await db.execute(
      "UPDATE notifications SET is_read = TRUE WHERE id = ?",
      [notificationId]
    );
    return result.affectedRows > 0;
  }

  static async markAllAsRead(userId) {
    const [result] = await db.execute(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    return result.affectedRows > 0;
  }

  static async getUnreadCount(userId) {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = Notification;