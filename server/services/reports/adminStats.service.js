const pool = require("../../config/db");

/*
  ADMIN DASHBOARD STATISTICS
  - total users (active)
  - faculty count
  - pending principal approvals
  - pending password resets
  - today’s approved leaves
  - this month’s approved leaves
*/

async function getAdminStats() {
  const [[stats]] = await pool.query(`
    SELECT
      /* total active users */
      (SELECT COUNT(*)
       FROM users
       WHERE is_active = 1) AS total_users,

      /* active faculty */
      (SELECT COUNT(*)
       FROM users
       WHERE role = 'faculty'
         AND is_active = 1) AS total_faculty,

      /* pending principal approvals */
      (SELECT COUNT(*)
       FROM leave_requests
       WHERE hod_status = 'approved'
         AND principal_status = 'pending'
         AND final_status = 'pending') AS pending_principal_approvals,

      /* pending password reset requests */
      (SELECT COUNT(*)
       FROM password_reset_requests
       WHERE status = 'pending') AS pending_password_resets,

      /* today's approved leaves */
      (SELECT COUNT(*)
       FROM leave_requests
       WHERE final_status = 'approved'
         AND CURDATE() BETWEEN start_date AND end_date) AS today_leaves,

      /* this month approved leaves */
      (SELECT COUNT(*)
       FROM leave_requests
       WHERE final_status = 'approved'
         AND MONTH(applied_on) = MONTH(CURDATE())
         AND YEAR(applied_on) = YEAR(CURDATE())) AS this_month_leaves
  `);

  return stats;
}

module.exports = {
  getAdminStats
};
