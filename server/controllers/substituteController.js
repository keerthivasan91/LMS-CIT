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
          lr.leave_id,
          lr.leave_type,
          lr.start_date,
          lr.start_session,
          lr.end_date,
          lr.end_session,
          lr.days,
          lr.reason,
          a.status AS substitute_status,
          a.responded_on,
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
   2. ACCEPT SUBSTITUTE REQUEST  (Updated for HOD flow)
============================================================= */
async function acceptSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* ------------------------------------------------------------
       Fetch leave + applicant info INCLUDING role
    -------------------------------------------------------------*/
    const [rows] = await conn.query(
      `SELECT 
          a.arrangement_id,
          a.leave_id,
          lr.user_id,
          u.email,
          u.phone,
          u.name,
          u.role
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.arrangement_id = ?
       LIMIT 1`,
      [arrangementId]
    );

    if (!rows.length) throw new Error("Substitute request not found");

    const info = rows[0];

    /* ------------------------------------------------------------
       Step 1 — Update arrangement (accepted)
    -------------------------------------------------------------*/
    await conn.query(
      `UPDATE arrangements 
       SET status = 'accepted',
           responded_on = NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    /* ------------------------------------------------------------
       Step 2 — Update leave_requests
       SPECIAL LOGIC FOR HOD
    -------------------------------------------------------------*/

    if (info.role === "hod") {
      // HOD applicant → Skip HOD approval
      await conn.query(
        `UPDATE leave_requests 
         SET substitute_status='accepted',
             hod_status='approved',
             principal_status='pending',
             updated_at = NOW()
         WHERE leave_id = ?`,
        [info.leave_id]
      );
    } else {
      // Normal faculty/staff flow
      await conn.query(
        `UPDATE leave_requests 
         SET substitute_status='accepted  ',
             hod_status='pending',
             principal_status=NULL,
             updated_at = NOW()
         WHERE leave_id = ?`,
        [info.leave_id]
      );
    }

    await conn.commit();

    /* ------------------------------------------------------------
       Step 3 — Notify applicant only
    -------------------------------------------------------------*/
    if (info.email) {
      const nextStage = info.role === "hod" ? "Principal" : "HOD";

      await sendMail(
        info.email,
        "Substitute Accepted",
        `
          <h2>Hello ${info.name},</h2>
          <p>Your substitute has <b>accepted</b> your request.</p>
          <p>Your leave has now moved to <b>${nextStage} approval stage</b>.</p>
        `
      );
    }

    if (info.phone) {
      const nextStage = info.role === "hod" ? "Principal" : "HOD";
      await sendSMS(info.phone, `Your substitute accepted. Sent to ${nextStage}.`);
    }

    res.json({ ok: true, message: "Substitute accepted" });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* =============================================================
   3. REJECT SUBSTITUTE REQUEST  (Final Workflow)
============================================================= */
async function rejectSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* ------------------------------------------------------------
       Fetch leave + applicant info
    -------------------------------------------------------------*/
    const [rows] = await conn.query(
      `SELECT 
          a.arrangement_id,
          a.leave_id,
          lr.user_id,
          u.email,
          u.phone,
          u.name
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.arrangement_id = ?
       LIMIT 1`,
      [arrangementId]
    );

    if (!rows.length) throw new Error("Substitute request not found");

    const info = rows[0];

    /* ------------------------------------------------------------
       Step 1 — Update arrangement
    -------------------------------------------------------------*/
    await conn.query(
      `UPDATE arrangements
       SET status='rejected',
           responded_on = NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    /* ------------------------------------------------------------
       Step 2 — Update leave_requests
       substitute_status = rejected
       hod_status = NULL
       principal_status = NULL
       final_status = rejected
    -------------------------------------------------------------*/
    await conn.query(
      `UPDATE leave_requests
       SET substitute_status='rejected',
           hod_status=NULL,
           principal_status=NULL,
           final_status='rejected',
           updated_at = NOW()
       WHERE leave_id = ?`,
      [info.leave_id]
    );

    await conn.commit();

    /* ------------------------------------------------------------
       Step 3 — Notify applicant only
    -------------------------------------------------------------*/
    if (info.email) {
      await sendMail(
        info.email,
        "Substitute Rejected",
        `
          <h2>Hello ${info.name},</h2>
          <p>Your substitute has <b>rejected</b> your request.</p>
          <p>Your leave request is now <b>rejected</b> and closed.</p>
        `
      );
    }

    if (info.phone) {
      await sendSMS(info.phone, "Your substitute rejected the request. Leave closed.");
    }

    res.json({ ok: true, message: "Substitute rejected" });
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
};
