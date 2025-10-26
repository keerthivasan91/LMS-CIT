const db = require('../config/db');

class Holiday {
  static async findAll() {
    const [rows] = await db.execute(
      "SELECT id, date, name FROM holidays ORDER BY date"
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT id, date, name FROM holidays WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create(holidayData) {
    const { date, name } = holidayData;
    const [result] = await db.execute(
      "INSERT INTO holidays (date, name) VALUES (?, ?)",
      [date, name]
    );
    return result.insertId;
  }

  static async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM holidays WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Holiday;