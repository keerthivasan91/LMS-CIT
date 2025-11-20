const pool = require("../config/db");
const sendMail = require("../config/mailer");

// USER → SEND FORGOT PASSWORD REQUEST
async function requestPasswordReset(req, res, next) {
  try {
    const { user_id, email, reason } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({ message: "User ID and Email required" });
    }

    // Validate user exists
    const [user] = await pool.query(
      "SELECT * FROM users WHERE user_id = ? AND email = ? LIMIT 1",
      [user_id, email]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "Invalid User ID or Email" });
    }

    // Insert into password_reset_requests table
    await pool.query(
      `INSERT INTO password_reset_requests 
       (user_id, email, status)
       VALUES (?, ?, 'pending')`,
      [user_id, email]
    );

    // Notify admin via email
    await sendMail(
      process.env.ADMIN_EMAIL,
      "LMS: Password Reset Request",
      `
        <h3>Password Reset Request</h3>
        <p><b>Name:</b> ${user[0].name}</p>
        <p><b>User ID:</b> ${user_id}</p>
        <p><b>Email:</b> ${email}</p>
        <p>Please log in to the LMS admin panel and reset their password.</p>
      `
    );

    res.json({ ok: true, message: "Request sent to admin. You'll be notified once password is reset." });

  } catch (err) {
    next(err);
  }
}

module.exports = { requestPasswordReset };
