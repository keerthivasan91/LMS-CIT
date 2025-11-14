// server/config/sms.js
const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken  = process.env.TWILIO_TOKEN;
const fromNumber = process.env.TWILIO_FROM;

let client = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log("📱 Twilio SMS service is ready");
} else {
  console.warn("⚠ Twilio credentials missing — SMS disabled");
}

/**
 * Send SMS
 * @param {String} to 
 * @param {String} message 
 */
async function sendSMS(to, message) {
  try {
    if (!client) {
      console.warn("⚠ SMS not sent: Twilio not configured");
      return;
    }

    await client.messages.create({
      body: message,
      to,
      from: fromNumber,
    });

    console.log("📩 SMS sent:", to);
  } catch (err) {
    console.error("❌ SMS failed:", err.message);
  }
}

module.exports = sendSMS;
