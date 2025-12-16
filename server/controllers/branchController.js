const pool = require('../config/db');

/* ============================================================
   1) Get Branches (for all logged-in users)
============================================================ */
async function getBranches(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT department_code
       FROM users
       WHERE department_code IS NOT NULL
         AND department_code != ''
         AND role IN ('faculty', 'hod')
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


/* ============================================================
   2) Get All Branches (Admin/Principal Only)
============================================================ */
async function getAllBranches(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT department_code
       FROM departments
       WHERE department_code IS NOT NULL
         AND department_code != ''
       ORDER BY department_code`
    );

    return res.json({
      ok: true,
      departments: rows.map(r => r.department_code)
    });

  } catch (err) {
    next(err);
  }
}


/* ============================================================
   3) STAFF only from a branch
============================================================ */
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
         AND (role = 'staff' OR role = 'admin')
         AND is_active = 1
       ORDER BY name`,
      [branch]
    );

    return res.json({
      ok: true,
      staff: rows.map(r => ({
        user_id: r.user_id,
        name: r.name
      }))
    });

  } catch (err) {
    next(err);
  }
}


/* ============================================================
   4) FACULTY + HOD from a branch
============================================================ */
async function getFacultyByBranch(req, res, next) {
  try {
    const branch = req.params.branch?.trim();

    if (!branch) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const [rows] = await pool.query(
      `SELECT user_id, name, role
       FROM users
       WHERE department_code = ?
         AND role IN ('faculty', 'hod')
         AND is_active = 1
       ORDER BY name`,
      [branch]
    );

    return res.json({
      ok: true,
      faculty: rows.map(r => ({
        user_id: r.user_id,
        name: r.name,
        role: r.role
      }))
    });

  } catch (err) {
    next(err);
  }
}


module.exports = {
  getBranches,
  getAllBranches,
  getStaffByBranch,
  getFacultyByBranch
};
