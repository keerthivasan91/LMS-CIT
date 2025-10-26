const db = require('../config/db');

class Leave {
  static async create(leaveData) {
    const {
      user_id, department, leave_type, start_date, start_session,
      end_date, end_session, reason, days, substitute_user_id,
      substitute_status, arrangement_details
    } = leaveData;

    const [result] = await db.execute(
      `INSERT INTO leave_requests 
      (user_id, department, leave_type, start_date, start_session, end_date, end_session,
       reason, days, substitute_user_id, substitute_status, arrangement_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, department, leave_type, start_date, start_session, end_date, end_session,
       reason, days, substitute_user_id, substitute_status, arrangement_details]
    );

    return result.insertId;
  }

  static async findById(leaveId) {
    const [rows] = await db.execute(
      `SELECT lr.*, u1.name as requester_name, u2.name as substitute_name
       FROM leave_requests lr
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE lr.id = ?`,
      [leaveId]
    );
    return rows[0];
  }

  static async findByUserId(userId, limit = 20) {
    const [rows] = await db.execute(
      `SELECT lr.id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, 
              lr.principal_status, lr.final_status, lr.applied_at, u.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u ON lr.substitute_user_id = u.user_id 
       WHERE lr.user_id = ? 
       ORDER BY lr.applied_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  static async findByDepartment(department) {
    const [rows] = await db.execute(
      `SELECT lr.id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, 
              lr.principal_status, lr.final_status, lr.applied_at, u1.name as requester_name, 
              u2.name as substitute_name
       FROM leave_requests lr
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE u1.department = ?
       ORDER BY lr.applied_at DESC`,
      [department]
    );
    return rows;
  }

  static async findPendingHOD(department) {
    const [rows] = await db.execute(
      `SELECT lr.id, lr.user_id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, lr.final_status, 
              lr.applied_at, u1.name as requester_name, u2.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE lr.department = ? AND lr.substitute_status IN ('Accepted','Not Applicable') AND lr.hod_status = 'Pending'
       ORDER BY lr.applied_at DESC`,
      [department]
    );
    return rows;
  }

  static async findPendingPrincipal() {
    const [rows] = await db.execute(
      `SELECT lr.id, lr.user_id, lr.department, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, lr.principal_status, lr.final_status, 
              lr.applied_at, u1.name as requester_name, u2.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE lr.hod_status = 'Approved' AND lr.principal_status = 'Pending'
       ORDER BY lr.applied_at DESC`
    );
    return rows;
  }

  static async findAll(department = null) {
    let query = `
      SELECT lr.*, u1.name, u2.name as substitute_name 
      FROM leave_requests lr 
      LEFT JOIN users u1 ON lr.user_id = u1.user_id 
      LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
    `;
    const params = [];
    
    if (department) {
      query += " WHERE lr.department = ?";
      params.push(department);
    }
    
    query += " ORDER BY lr.applied_at DESC";
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updateHODStatus(leaveId, status) {
    const [result] = await db.execute(
      "UPDATE leave_requests SET hod_status = ?, hod_responded_at = NOW() WHERE id = ?",
      [status, leaveId]
    );
    return result.affectedRows > 0;
  }

  static async updatePrincipalStatus(leaveId, status) {
    const [result] = await db.execute(
      "UPDATE leave_requests SET principal_status = ?, principal_responded_at = NOW() WHERE id = ?",
      [status, leaveId]
    );
    return result.affectedRows > 0;
  }

  static async updateFinalStatus(leaveId, status) {
    const [result] = await db.execute(
      "UPDATE leave_requests SET final_status = ? WHERE id = ?",
      [status, leaveId]
    );
    return result.affectedRows > 0;
  }

  static async getUserStats(userId) {
    const [rows] = await db.execute(
      `SELECT
          COUNT(*) AS total,
          SUM(final_status = 'Approved') AS approved,
          SUM(final_status = 'Rejected') AS rejected,
          SUM(final_status = 'Pending') AS pending,
          SUM(days) AS total_days
       FROM leave_requests WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async getDepartmentStats(department) {
    const [rows] = await db.execute(
      `SELECT u.name,
              COUNT(lr.id) AS total,
              SUM(lr.final_status = 'Approved') AS approved,
              SUM(lr.final_status = 'Rejected') AS rejected,
              SUM(lr.final_status = 'Pending') AS pending,
              COALESCE(SUM(lr.days), 0) AS total_days
       FROM users u
       LEFT JOIN leave_requests lr ON u.user_id = lr.user_id
       WHERE u.department = ? AND u.role IN ('faculty', 'staff')
       GROUP BY u.user_id, u.name
       ORDER BY u.name`,
      [department]
    );
    return rows;
  }
}

module.exports = Leave;