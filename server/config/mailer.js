// server/config/mailer.js
const axios = require("axios");
const logger = require("../services/logger");
const queueEmail = require("../utils/mailQueue");

/**
 * Queue Email (unchanged)
 * -----------------------
 * Still queues mail into DB.
 * Worker or controller will call Brevo API.
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
    throw err;
  }
}

/**
 * ACTUAL EMAIL SENDER (Brevo API)
 * --------------------------------
 * This should be called from your worker.
 */
async function sendViaBrevo(to, subject, html) {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "LMS-CIT",
          email: process.env.MAIL_FROM || "superbob991@gmail.com"
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    );

    console.log(`📨 Email sent to ${to}`);
    return res.data;

  } catch (err) {
    console.error(
      "❌ Brevo email failed:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = {
  sendMail,
  sendViaBrevo
};
