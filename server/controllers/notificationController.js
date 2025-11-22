const pool = require("../config/db");

async function notificationCounters(req, res) {
  res.locals.pending_subs = 0;
  res.locals.pending_hod = 0;
  res.locals.pending_principal = 0;

  if (!req.session || !req.session.user) {
    return res.json({
      ok: true,
      pending_subs: 0,
      pending_hod: 0,
      pending_principal: 0
    });
  }

  try {
    const { user_id, role, department_code } = req.session.user;

    if (role === "faculty") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
     FROM arrangements
     WHERE substitute_id = ? 
       AND status = 'pending'`,
        [user_id]
      );

      res.locals.pending_subs = rows[0].count || 0;
    }




    if (role === "hod") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM leave_requests
         WHERE department_code = ?
           AND substitute_status IN ('Accepted','Not Applicable')
           AND hod_status='Pending'`,
        [department_code]
      );
      res.locals.pending_hod = rows[0].count || 0;
    }

    if (role === "principal" || role === "admin") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM leave_requests
         WHERE hod_status='Approved'
           AND principal_status='Pending'`
      );
      res.locals.pending_principal = rows[0].count || 0;
    }

    return res.json({
      ok: true,
      pending_subs: res.locals.pending_subs,
      pending_hod: res.locals.pending_hod,
      pending_principal: res.locals.pending_principal
    });

  } catch (err) {
    console.error("Notification Counter Error:", err);
    return res.json({
      ok: true,
      pending_subs: 0,
      pending_hod: 0,
      pending_principal: 0
    });
  }
}

module.exports = notificationCounters;
