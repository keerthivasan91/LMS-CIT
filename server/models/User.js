const db = require('../config/db');

class User {
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      "SELECT id, user_id, password, role, name, department, email, phone FROM users WHERE user_id = ?",
      [userId]
    );
    return rows[0];
  }

  static async findByCredentials(userId, password) {
    const [rows] = await db.execute(
      "SELECT id, user_id, password, role, name, department, email, phone FROM users WHERE user_id = ? AND password = ?",
      [userId, password]
    );
    return rows[0];
  }

  static async getBranches() {
    const [rows] = await db.execute(
      "SELECT DISTINCT department FROM users WHERE role = 'faculty' ORDER BY department"
    );
    return rows.map(row => row.department);
  }

  static async getStaffByBranch(branch) {
    const [rows] = await db.execute(
      "SELECT user_id, name FROM users WHERE department = ? AND role = 'faculty' ORDER BY name",
      [branch]
    );
    return rows.map(row => ({ id: row.user_id, name: row.name }));
  }

  static async updatePassword(userId, newPassword) {
    const [result] = await db.execute(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [newPassword, userId]
    );
    return result.affectedRows > 0;
  }

  static async getDepartmentUsers(department) {
    const [rows] = await db.execute(
      "SELECT user_id, name, role FROM users WHERE department = ? ORDER BY name",
      [department]
    );
    return rows;
  }
}

module.exports = User;