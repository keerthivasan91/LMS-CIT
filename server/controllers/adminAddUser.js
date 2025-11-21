// controllers/adminAddUser.js

const bcrypt = require("bcryptjs");
const sendMail = require("../config/mailer");
const UserModel = require("../models/User");

async function adminAddUser(req, res, next) {
  try {
    if (!req.user || !["admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      user_id,
      name,
      email,
      phone,
      role,
      desc,
      department_code,
      date_of_joining,
      password
    } = req.body;

    if (!user_id || !name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // For faculty / hod — department required
    if (!["admin", "principal"].includes(role) && !department_code) {
      return res
        .status(400)
        .json({ message: "Department required for faculty/hod/staff" });
    }

    // check if exists
    const exists = await UserModel.checkUserExists(user_id, email);
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    await UserModel.createUser({
      user_id,
      name,
      email,
      phone,
      role,
      designation: desc,
      department_code,
      date_of_joining,
      password: hashedPassword
    });

    // email
    await sendMail(
      email,
      "Your LMS Account Created",
      `<h2>Welcome ${name}</h2>
       <p>Your LMS account is created:</p>
       <p><b>User ID:</b> ${user_id}</p>
       <p><b>Password:</b> ${password}</p>`
    );

    res.json({ ok: true, message: "User added successfully" });

  } catch (err) {
    next(err);
  }
}

module.exports = { adminAddUser };
