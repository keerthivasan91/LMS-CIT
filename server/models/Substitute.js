const db = require('../config/db');

class Substitute {
  static async create(substituteData) {
    const { leave_request_id, requested_user_id, arrangement_details } = substituteData;
    
    const [result] = await db.execute(
      "INSERT INTO substitute_requests (leave_request_id, requested_user_id, arrangement_details) VALUES (?, ?, ?)",
      [leave_request_id, requested_user_id, arrangement_details]
    );
    
    return result.insertId;
  }

  static async findByRequestedUserId(userId, status = null, limit = 10) {
    let query = `
      SELECT sr.id, lr.id as leave_id, lr.user_id, lr.leave_type, lr.start_date, lr.end_date, 
             lr.days, lr.reason, lr.arrangement_details, sr.status, sr.responded_at, u.name as requester_name
      FROM substitute_requests sr
      JOIN leave_requests lr ON sr.leave_request_id = lr.id
      JOIN users u ON lr.user_id = u.user_id
      WHERE sr.requested_user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      query += " AND sr.status = ?";
      params.push(status);
    }
    
    query += " ORDER BY sr.id DESC LIMIT ?";
    params.push(limit);
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updateStatus(requestId, status) {
    const [result] = await db.execute(
      "UPDATE substitute_requests SET status = ?, responded_at = NOW() WHERE id = ?",
      [status, requestId]
    );
    return result.affectedRows > 0;
  }

  static async updateLeaveSubstituteStatus(requestId, status) {
    const [result] = await db.execute(
      `UPDATE leave_requests lr 
       JOIN substitute_requests sr ON lr.id = sr.leave_request_id 
       SET lr.substitute_status = ?, lr.substitute_responded_at = NOW() 
       WHERE sr.id = ?`,
      [status, requestId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Substitute;