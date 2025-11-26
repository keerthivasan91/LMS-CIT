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

    /* ============================================================
       1) SUBSTITUTE PENDING REQUESTS 
          (faculty + staff + hod both get arrangement requests)
    ============================================================ */
    if (role === "faculty" || role === "staff" || role==="hod") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM arrangements
         WHERE substitute_id = ?
           AND status = 'pending'`,
        [user_id]
      );

      res.locals.pending_subs = rows[0].count || 0;
    }

    /* ============================================================
       2) HOD PENDING REQUESTS 
          Show only when:
          - substitute workflow is complete => final_substitute_status = 'accepted'
          - hod_status = 'pending'
    ============================================================ */
    if (role === "hod") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM leave_requests
         WHERE department_code = ?
           AND final_substitute_status = 'accepted'
           AND hod_status = 'pending'`,
        [department_code]
      );

      res.locals.pending_hod = rows[0].count || 0;
    }

    /* ============================================================
       3) PRINCIPAL PENDING REQUESTS 
          Show when:
          - hod_status = 'approved'
          - principal_status = 'pending'
    ============================================================ */
    if (role === "principal" || role === "admin") {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM leave_requests
         WHERE hod_status = 'approved'
           AND principal_status = 'pending'`
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
