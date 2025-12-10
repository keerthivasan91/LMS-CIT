// mailWorker.js
const pool = require("../config/db");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  pool: true, // use nodemailer pooling in production OR let nginx/email provider handle it
});

// Optional: verify transporter on startup
transporter.verify().catch((err) => {
  console.error("Mail transporter verify failed:", err);
});

const BATCH = 10;
const MAX_ATTEMPTS = 5;

async function claimBatch(conn, token, batchSize = BATCH) {
  // Atomically mark up to `batchSize` rows as processing with a token
  const [res] = await conn.query(
    `UPDATE mail_queue
     SET processing_token = ?, processing_started_at = NOW()
     WHERE id IN (
       SELECT id FROM (
         SELECT id FROM mail_queue
         WHERE (status = 'pending' OR (status = 'failed' AND (next_retry_at IS NULL OR next_retry_at <= NOW())))
         AND attempts < ?
         ORDER BY id
         LIMIT ?
       ) tmp
     )`,
    [token, MAX_ATTEMPTS, batchSize]
  );
  return res.affectedRows;
}

async function fetchClaimed(conn, token) {
  const [rows] = await conn.query(
    `SELECT * FROM mail_queue WHERE processing_token = ?`,
    [token]
  );
  return rows;
}

async function markSent(conn, id) {
  await conn.query(
    `UPDATE mail_queue 
     SET status='sent', attempts = attempts + 1, processing_token = NULL, processing_started_at = NULL
     WHERE id = ?`,
    [id]
  );
}

async function markFailed(conn, id, errMsg, attempts) {
  const nextDelayMinutes = Math.min(60 * 24, Math.pow(2, attempts)); // cap backoff if you want
  await conn.query(
    `UPDATE mail_queue
     SET status = CASE WHEN attempts + 1 >= ? THEN 'permanent_failed' ELSE 'failed' END,
         attempts = attempts + 1,
         last_error = ?,
         next_retry_at = CASE WHEN attempts + 1 >= ? THEN NULL ELSE DATE_ADD(NOW(), INTERVAL ? MINUTE) END,
         processing_token = NULL,
         processing_started_at = NULL
     WHERE id = ?`,
    [MAX_ATTEMPTS, errMsg, MAX_ATTEMPTS, nextDelayMinutes, id]
  );
}

async function processMailQueue() {
  const token = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Claim rows (atomically mark as processing)
    await claimBatch(conn, token, BATCH);

    await conn.commit();

    // 2) Fetch claimed rows (outside transaction to minimize locks)
    const rows = await fetchClaimed(conn, token);

    for (const mail of rows) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.MAIL_USER,
          to: mail.to_email,
          subject: mail.subject,
          html: mail.body,
        });

        await markSent(conn, mail.id);
      } catch (err) {
        // Use concise error message (avoid storing huge stack traces)
        const msg = err && err.message ? err.message.slice(0, 1000) : String(err);
        await markFailed(conn, mail.id, msg, mail.attempts || 0);
      }
    }
  } catch (outerErr) {
    await conn.rollback().catch(() => {});
    console.error("mail worker failed:", outerErr);
  } finally {
    conn.release();
  }
}

module.exports = processMailQueue;
