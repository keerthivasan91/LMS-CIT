const pool = require("../config/db");
const sendMail = require("../config/mailer");
const sendSMS = require("../config/sms");

/* =============================================================
   1. GET SUBSTITUTE REQUESTS FOR LOGGED-IN USER
============================================================= */
async function substituteRequestsForUser(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
          a.arrangement_id,
          a.leave_id,
          a.status AS substitute_status,
          a.responded_on,
          a.department_code,
          a.details,

          lr.leave_type,
          lr.start_date,
          lr.start_session,
          lr.end_date,
          lr.end_session,
          lr.days,
          lr.reason,
          lr.final_substitute_status,

          u.name AS requester_name,
          u.email AS requester_email,
          u.phone AS requester_phone
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.substitute_id = ?
       ORDER BY a.arrangement_id DESC`,
      [user_id]
    );

    res.json({ ok: true, requests: rows });
  } catch (err) {
    next(err);
  }
}

/* =============================================================
   HELPER – Check if all arrangements accepted
============================================================= */
async function checkAllAccepted(conn, leave_id) {
  const [[row]] = await conn.query(
    `SELECT 
        SUM(CASE WHEN status='accepted' THEN 1 ELSE 0 END) AS accepted,
        COUNT(*) AS total
     FROM arrangements
     WHERE leave_id = ?`,
    [leave_id]
  );

  return row.accepted === row.total;
}

/* =============================================================
   2. ACCEPT SUBSTITUTE REQUEST
============================================================= */
async function acceptSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;
  const subId = req.user.user_id;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Fetch arrangement + leave info
    const [[info]] = await conn.query(
      `SELECT 
          a.leave_id,
          a.substitute_id,
          u.role AS applicant_role,
          u.email,
          u.phone,
          u.name
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.arrangement_id = ? AND a.substitute_id = ?
       LIMIT 1`,
      [arrangementId, subId]
    );

    if (!info) throw new Error("Invalid substitute request");

    /* Step 1 — Accept THIS substitute row */
    await conn.query(
      `UPDATE arrangements 
       SET status='accepted', responded_on=NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    /* Step 2 — Check if all have accepted */
    /* =============================================================
   HELPER – Check if all arrangements accepted
============================================================= */
    


    if (!checkAllAccepted) {
      // Still pending → update leave as pending
      await conn.query(
        `UPDATE leave_requests
         SET final_substitute_status='pending'
         WHERE leave_id = ?`,
        [info.leave_id]
      );

      await conn.commit();
      return res.json({
        ok: true,
        message: "Accepted. Waiting for other substitutes."
      });
    }

    /* Step 3 — ALL accepted: Move leave to HOD/Principal */
    if (info.applicant_role === "hod") {
      // HOD → skips HOD stage
      await conn.query(
        `UPDATE leave_requests
         SET final_substitute_status='accepted',
             hod_status='approved',
             principal_status='pending',
             updated_at=NOW()
         WHERE leave_id = ?`,
        [info.leave_id]
      );
    } else {
      // Normal faculty
      await conn.query(
        `UPDATE leave_requests
         SET final_substitute_status='accepted',
             hod_status='pending',
             principal_status=NULL,
             updated_at=NOW()
         WHERE leave_id = ?`,
        [info.leave_id]
      );
    }

    await conn.commit();

    /* Step 4 — Notify applicant */
    if (info.email) {
      const nextStage = info.applicant_role === "hod" ? "Principal" : "HOD";

      sendMail(
        info.email,
        "Substitute Accepted",
        `
        <h3>Hello ${info.name},</h3>
        <p>All substitutes have <b>accepted</b> your request.</p>
        <p>Your leave is now forwarded to <b>${nextStage}</b>.</p>
      `
      );
    }

    if (info.phone) {
      const nextStage = info.applicant_role === "hod" ? "Principal" : "HOD";
      sendSMS(info.phone, `All substitutes accepted. Sent to ${nextStage}.`);
    }

    res.json({ ok: true, message: "All substitutes accepted. Moved to next stage." });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* =============================================================
   3. REJECT SUBSTITUTE REQUEST
============================================================= */
async function rejectSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;
  const subId = req.user.user_id;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Fetch leave + applicant details
    const [[info]] = await conn.query(
      `SELECT 
          a.leave_id,
          u.email,
          u.phone,
          u.name
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.arrangement_id = ? AND a.substitute_id = ?
       LIMIT 1`,
      [arrangementId, subId]
    );

    if (!info) throw new Error("Invalid substitute request");

    /* Step 1 — Reject this substitute request */
    await conn.query(
      `UPDATE arrangements
       SET status='rejected', responded_on=NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    /* Step 2 — Reject entire leave */
    await conn.query(
      `UPDATE leave_requests
       SET final_substitute_status='rejected',
           hod_status=NULL,
           principal_status=NULL,
           final_status='rejected',
           updated_at=NOW()
       WHERE leave_id = ?`,
      [info.leave_id]
    );

    await conn.commit();

    /* Step 3 — Notify applicant */
    if (info.email) {
      sendMail(
        info.email,
        "Substitute Rejected",
        `
        <h3>Hello ${info.name},</h3>
        <p>Your substitute has <b>rejected</b> your request.</p>
        <p>Your leave is now <b>rejected</b>.</p>
      `
      );
    }

    if (info.phone) {
      sendSMS(info.phone, "Your substitute rejected. Leave request closed.");
    }

    res.json({ ok: true, message: "Substitute rejected. Leave closed." });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* =============================================================
   EXPORTS
============================================================= */
module.exports = {
  substituteRequestsForUser,
  acceptSubstitute,
  checkAllAccepted,
  rejectSubstitute,
};
