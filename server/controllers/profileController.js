// controllers/profileController.js

const bcrypt = require("bcryptjs");
const ProfileModel = require("../models/profile");

/* ---------------------------------------------------------
   GET PROFILE STATISTICS
--------------------------------------------------------- */
async function getProfileStats(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const stats = await ProfileModel.getProfileStatsModel(user_id);

    res.json({ ok: true, stats });
  } catch (err) {
    next(err);
  }
}

/* ---------------------------------------------------------
   CHANGE PASSWORD
--------------------------------------------------------- */
async function changePassword(req, res, next) {
  try {
    const user_id = req.user.user_id;
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Fetch stored hash
    const userRow = await ProfileModel.getUserPassword(user_id);
    if (!userRow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(current_password, userRow.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await ProfileModel.updateUserPassword(user_id, hashedPassword);

    res.json({ ok: true, message: "Password changed successfully" });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfileStats,
  changePassword,
};
