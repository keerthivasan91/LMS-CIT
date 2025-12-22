// services/mail.service.js
const sendMail = require("../config/mailer");

/**
 * Unified Mail API
 */
async function sendMailService({ to, subject, html }) {
  if (!to) return;

  try {
    await sendMail(to, subject, html);
  } catch (err) {
    console.error("Mail error:", err.message);
  }
}

module.exports = { sendMail: sendMailService };
