// server/config/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",  // or smtp
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === "true", // false for TLS, true for SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

// Optional — verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email server connection failed:", error.message);
  } else {
    console.log("📨 Email server is ready to send messages");
  }
});

/**
 * Send Email
 * @param {String} to 
 * @param {String} subject 
 * @param {String} html 
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
  } catch (err) {
    console.error("❌ Mail error:", err.message);
  }
}

module.exports = sendMail;
