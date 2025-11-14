const pool = require('../config/db');

/**
 * Get all faculty branches (departments)
 */
async function getBranches(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT department_code
       FROM users
       WHERE role = 'faculty'
         AND department_code IS NOT NULL
         AND department_code != ''
       ORDER BY department_code`
    );

    return res.json({
      ok: true,
      branches: rows.map(r => r.department_code)
    });

  } catch (err) {
    next(err);
  }
}

/**
 * Get staff (faculty list) for a department
 */
async function getStaffByBranch(req, res, next) {
  try {
    const branch = req.params.branch?.trim();

    if (!branch) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const [rows] = await pool.query(
      `SELECT user_id, name
       FROM users
       WHERE department_code = ?
         AND role = 'faculty'
         AND is_active = 1
       ORDER BY name`,
      [branch]
    );

    return res.json({
      ok: true,
      staff: rows.map(r => ({
        id: r.user_id,
        name: r.name
      }))
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBranches,
  getStaffByBranch
};
