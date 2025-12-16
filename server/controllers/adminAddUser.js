const bcrypt = require("bcryptjs");
const sendMail = require("../config/mailer");
const UserModel = require("../models/User");

async function adminAddUser(req, res, next) {
  try {
    if (!req.user || !["admin"].includes(req.user.role)) {
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
      designation,
      date_joined,
      password
    } = req.body;

    if (!user_id || !name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Faculty/HOD/staff must belong to a department
    if (!["admin", "principal"].includes(role) && !department_code) {
      return res.status(400).json({
        message: "Department required for faculty/HOD/staff"
      });
    }

    // Fetch user (active or inactive)
    const existingUser = await UserModel.getUserFull(user_id);

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (existingUser.is_active === 1) {
        return res.status(409).json({ message: "User already exists" });
      }

      // User exists but inactive → Reactivate
      await UserModel.reactivateUser(user_id, {
        name,
        email,
        phone,
        role,
        department_code,
        designation: desc || designation,
        date_joined,
        password: hashedPassword
      });

      return res.json({
        ok: true,
        type: "success",
        message: "User already existed but was inactive — user reactivated"
      });
    }

    // Create new user
    await UserModel.createUser({
      user_id,
      name,
      email,
      phone,
      role,
      department_code,
      designation: desc || designation,
      date_joined,
      password: hashedPassword
    });

    sendMail(
      email,
      "Your LMS Account Created",
      `<h2>Welcome ${name}</h2>
       <p>Your LMS account is created:</p>
       <p><b>User ID:</b> ${user_id}</p>
       <p><b>Password:</b> ${password}</p>`
    );

    res.json({ ok: true, type: "success", message: "User added successfully" });

  } catch (err) {
    next(err);
  }
}

module.exports = { adminAddUser };
