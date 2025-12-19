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

  return row.total > 0 && row.accepted === row.total;
}

/* =============================================================
   2. ACCEPT SUBSTITUTE REQUEST
============================================================= */
async function acceptSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;
  const substituteId = req.user.user_id;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* ---------------------------------------------------------
       STEP 0 — Validate substitute request
    --------------------------------------------------------- */
    const [[info]] = await conn.query(
      `SELECT 
          a.leave_id,
          u.role AS applicant_role,
          u.email,
          u.phone,
          u.name
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.arrangement_id = ?
         AND a.substitute_id = ?
       LIMIT 1`,
      [arrangementId, substituteId]
    );

    if (!info) {
      throw new Error("Invalid substitute request");
    }

    /* ---------------------------------------------------------
       STEP 1 — Accept THIS arrangement
    --------------------------------------------------------- */
    await conn.query(
      `UPDATE arrangements
       SET status = 'accepted',
           responded_on = NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    /* ---------------------------------------------------------
       STEP 2 — RECOMPUTE substitute status (CRITICAL FIX)
    --------------------------------------------------------- */
    const [[stats]] = await conn.query(
      `SELECT
          COUNT(*) AS total,
          SUM(status = 'accepted') AS accepted,
          SUM(status = 'rejected') AS rejected
       FROM arrangements
       WHERE leave_id = ?`,
      [info.leave_id]
    );

    let finalSubstituteStatus = "pending";

    if (stats.rejected > 0) {
      finalSubstituteStatus = "rejected";
    } else if (stats.total > 0 && stats.accepted === stats.total) {
      finalSubstituteStatus = "accepted";
    }

    /* ---------------------------------------------------------
       STEP 3 — Update leave_requests based on recomputation
    --------------------------------------------------------- */
    if (finalSubstituteStatus === "accepted") {

      if (info.applicant_role === "hod") {
        // HOD applying → skip HOD, go to Principal
        await conn.query(
          `UPDATE leave_requests
           SET final_substitute_status = 'accepted',
               hod_status = 'approved',
               principal_status = 'pending',
               updated_at = NOW()
           WHERE leave_id = ?`,
          [info.leave_id]
        );
      } else {
        // Faculty / Staff / Admin → go to HOD
        await conn.query(
          `UPDATE leave_requests
           SET final_substitute_status = 'accepted',
               hod_status = 'pending',
               principal_status = 'pending',
               updated_at = NOW()
           WHERE leave_id = ?`,
          [info.leave_id]
        );
      }

    } else {
      // Still waiting for other substitutes
      await conn.query(
        `UPDATE leave_requests
         SET final_substitute_status = 'pending',
             updated_at = NOW()
         WHERE leave_id = ?`,
        [info.leave_id]
      );
    }

    await conn.commit();

    /* ---------------------------------------------------------
       STEP 4 — Notify applicant (AFTER COMMIT)
    --------------------------------------------------------- */
    if (finalSubstituteStatus === "accepted") {
      const nextStage =
        info.applicant_role === "hod" ? "Principal" : "HOD";

      if (info.email) {
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
        sendSMS(
          info.phone,
          `All substitutes accepted. Sent to ${nextStage}.`
        );
      }

      return res.json({
        ok: true,
        message: "All substitutes accepted. Moved to next stage."
      });
    }

    return res.json({
      ok: true,
      message: "Accepted. Waiting for other substitutes."
    });

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
  const substituteId = req.user.user_id;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

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
      [arrangementId, substituteId]
    );

    if (!info) throw new Error("Invalid substitute request");

    /* Step 1 — Reject arrangement */
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
           hod_status='rejected',
           principal_status='rejected',
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
        <p>Your substitute has <b>rejected</b> the request.</p>
        <p>Your leave has been <b>rejected</b>.</p>
        `
      );
    }

    if (info.phone) {
      sendSMS(info.phone, "Substitute rejected. Leave request closed.");
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
  rejectSubstitute,
  checkAllAccepted
};
