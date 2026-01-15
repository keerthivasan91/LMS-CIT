// server/services/reports/leaveReport.service.js

const pool = require("../../config/db");

/**
 * Get filtered leave history for admin / principal download
 */
async function getLeaveHistory({ department, startDate, endDate }) {
  let query = `
    SELECT
      lr.leave_id,
      u.user_id,
      u.name AS requester_name,
      u.designation,
      u.department_code,
      d.department_name,
      lr.leave_type,
      lr.start_date,
      lr.end_date,
      lr.days,
      lr.final_status,
      lr.applied_on
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    LEFT JOIN departments d ON u.department_code = d.department_code
    WHERE lr.applied_on BETWEEN ? AND ? AND lr.final_status='approved'
  `;

  const params = [startDate, endDate];

  if (department && department !== "ALL") {
    query += " AND u.department_code = ? ";
    params.push(department);
  }

  query += " ORDER BY lr.applied_on DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

module.exports = {
  getLeaveHistory
};
