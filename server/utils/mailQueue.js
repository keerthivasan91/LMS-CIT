const pool = require("../config/db");

async function queueEmail(to_email, subject, body) {
  const [result] = await pool.query(
    "INSERT INTO mail_queue (to_email, subject, body) VALUES (?, ?, ?)",
    [to_email, subject, body]
  );
  return result.insertId;
}

module.exports = queueEmail;
