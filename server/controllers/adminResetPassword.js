// controllers/adminResetController.js

const bcrypt = require("bcryptjs");
const AdminModel = require("../models/Admin");
const { passwordResetByAdminMail } = require("../services/mailTemplates/auth.templates");

async function getResetRequests(req, res, next) {
  try {
    const rows = await AdminModel.getPendingPasswordResets();
    res.json({ requests: rows });
  } catch (err) {
    next(err);
  }
}

async function adminResetPasswordFinal(req, res, next) {
  try {
    const { user_id, new_password } = req.body;

    if (!user_id || !new_password) {
      return res.status(400).json({
        message: "user_id and new_password are required"
      });
    }

    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await AdminModel.resetPasswordAndResolve(user_id, hashed);
    const user = await AdminModel.getUserById(user_id);
    res.json({
      ok: true,
      message: `Password updated for ${user_id}`
    });

    // Notify user via email
    await passwordResetByAdminMail(user, new_password);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getResetRequests,
  adminResetPasswordFinal
};
