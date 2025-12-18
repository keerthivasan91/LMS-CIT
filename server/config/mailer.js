// server/config/mailer.js
const nodemailer = require("nodemailer");
const logger = require("../services/logger");
const queueEmail = require("../utils/mailQueue");

// We keep transporter for worker (not used here anymore)
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

// Verify SMTP connection for debugging only
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email server connection failed:", error.message);
    logger.error(`Mail service health check failed: ${error.message}`);
  } else {
    console.log("📨 Email server is ready (SMTP verification successful)");
    logger.info("Mail service is ready (SMTP verification successful)");
  }
});

/**
 * Queue Email Instead of Sending Directly
 * ---------------------------------------
 * This function NO LONGER sends mail immediately.
 * It only inserts the mail into `mail_queue`.
 * The worker will send the email asynchronously.
 */
async function sendMail(to, subject, html) {
  try {
    const queueId = await queueEmail(to, subject, html);

    logger.info(`Mail queued for: ${to} (queue_id=${queueId})`);
    console.log(`📥 Email queued → ${to} (queue_id=${queueId})`);

    return queueId;

  } catch (err) {
    console.error("❌ Failed to queue email:", err.message);
    logger.error(`Failed to queue email to ${to}: ${err.message}`);
  }
}

module.exports = sendMail;
