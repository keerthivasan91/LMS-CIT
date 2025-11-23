// controllers/adminDeleteUser.js

const AdminModel = require("../models/Admin");

async function adminDeleteUser(req, res, next) {
  try {
    if (!["admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userId = req.params.userId;

    const user = await AdminModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await AdminModel.deleteUser(userId);

    res.json({ ok: true, message: "User deleted successfully" });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminDeleteUser
};
