const pool = require("../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

async function processMailQueue() {
  // Fetch pending and failed emails
  const [rows] = await pool.query(
    "SELECT * FROM mail_queue WHERE status IN ('pending', 'failed') LIMIT 10"
  );

  for (const mail of rows) {
    try {
      await transporter.sendMail({
        to: mail.to_email,
        subject: mail.subject,
        html: mail.body
      });

      await pool.query(
        "UPDATE mail_queue SET status='sent', last_error=NULL WHERE id=?",
        [mail.id]
      );

      console.log("Sent email:", mail.to_email);

    } catch (err) {
      await pool.query(
        "UPDATE mail_queue SET status='failed', last_error=? WHERE id=?",
        [err.message, mail.id]
      );

      console.error("Failed email:", mail.to_email, err.message);
    }
  }
}

module.exports = processMailQueue;
