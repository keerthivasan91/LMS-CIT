// server/config/mailer.js
const nodemailer = require("nodemailer");
const logger = require("../services/logger");

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

// Verify mail server connection
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email server connection failed:", error.message);
  } else {
    console.log("📨 Email server is ready to send messages");
  }
});

/**
 * Send Email
 */
async function sendMail(to, subject, html) {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log("📧 Email sent to:", to);
    logger.info(`Mail sent to: ${to}`);      // <-- FIXED (moved inside sendMail)

  } catch (err) {
    console.error("❌ Mail error:", err.message);
    logger.error(`Mail error to ${to}: ${err.message}`);
  }
}

module.exports = sendMail;
