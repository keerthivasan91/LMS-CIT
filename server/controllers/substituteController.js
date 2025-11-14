const pool = require('../config/db');
const sendMail = require('../config/mailer');
const sendSMS = require('../config/sms');

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
          lr.user_id,
          lr.leave_type,
          lr.start_date,
          lr.end_date,
          lr.days,
          lr.reason,
          a.status,
          a.responded_on,
          u.name AS requester_name,
          u.email AS requester_email,
          u.phone AS requester_phone
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.substitute_id = ?
       ORDER BY a.arrangement_id DESC
       LIMIT 20`,
      [user_id]
    );

    res.json({ ok: true, requests: rows });
  } catch (err) {
    next(err);
  }
}

/* =============================================================
   2. ACCEPT SUBSTITUTE REQUEST
============================================================= */
async function acceptSubstitute(req, res, next) {
  const arrangementId = req.params.arrangementId;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Fetch original request info
    const [rows] = await conn.query(
      `SELECT 
          a.arrangement_id,
          lr.leave_id,
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

    if (!rows.length) {
      throw new Error("Substitute request not found");
    }

    const reqInfo = rows[0];

    // Update arrangements table
    await conn.query(
      `UPDATE arrangements
       SET status='accepted',
           responded_on = NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    // Update leave_requests table
    await conn.query(
      `UPDATE leave_requests
       SET substitute_status='accepted',
           updated_at = NOW()
       WHERE leave_id = ?`,
      [reqInfo.leave_id]
    );

    await conn.commit();

    // Email Notification
    await sendMail(
      reqInfo.email,
      "Substitute Request Accepted",
      `
        <h2>Substitute Request Accepted</h2>
        <p>Hello ${reqInfo.name},</p>
        <p>Your substitute arrangement request has been <b>accepted</b>.</p>
      `
    );

    // SMS Notification
    await sendSMS(reqInfo.phone, "Your substitute request has been accepted.");

    res.json({ ok: true, message: "Substitute accepted" });

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

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Fetch request info
    const [rows] = await conn.query(
      `SELECT 
          a.arrangement_id,
          lr.leave_id,
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

    if (!rows.length) {
      throw new Error("Substitute request not found");
    }

    const reqInfo = rows[0];

    // Update arrangement
    await conn.query(
      `UPDATE arrangements
       SET status='rejected',
           responded_on = NOW()
       WHERE arrangement_id = ?`,
      [arrangementId]
    );

    // Update leave request
    await conn.query(
      `UPDATE leave_requests
       SET substitute_status='rejected',
           final_status='rejected',
           updated_at = NOW()
       WHERE leave_id = ?`,
      [reqInfo.leave_id]
    );

    await conn.commit();

    // Email
    await sendMail(
      reqInfo.email,
      "Substitute Request Rejected",
      `
        <h2>Substitute Request Rejected</h2>
        <p>Hello ${reqInfo.name},</p>
        <p>Your substitute arrangement request has been <b>rejected</b>.</p>
      `
    );

    // SMS
    await sendSMS(reqInfo.phone, "Your substitute request has been rejected.");

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
