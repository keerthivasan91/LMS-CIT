const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { sendMail } = require("../services/mail.service");
const UserModel = require("../models/User");
const { userCreated } = require("../services/mailTemplates/user.templates");
const leaveCreditService = require("../services/leave/leaveCredit.service");

async function adminAddUser(req, res, next) {
  const conn = await pool.getConnection();

  try {
    if (!req.user || req.user.role !== "admin") {
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

    if (!user_id || !name || !email || !role || !date_joined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["admin", "principal"].includes(role) && !department_code) {
      return res.status(400).json({
        message: "Department required for faculty/HOD/staff"
      });
    }

    await conn.beginTransaction();

    const existingUser = await UserModel.getUserFull(user_id);
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    if (existingUser) {
      if (existingUser.is_active === 1) {
        await conn.rollback();
        return res.status(409).json({ message: "User already exists" });
      }

      // Reactivate user
      await UserModel.reactivateUser(user_id, {
        name,
        email,
        phone,
        role,
        department_code,
        designation: desc || designation,
        date_joined,
        password: hashedPassword || existingUser.password
      });

      // ✅ Credit leaves on reactivation
      await leaveCreditService.creditYearlyLeaves({
        user_id,
        role,
        date_joined
      });

      await conn.commit();
      return res.json({
        ok: true,
        message: "User reactivated and leave credited"
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

    // ✅ Credit leaves for new user
    await leaveCreditService.creditYearlyLeaves({
      user_id,
      role,
      date_joined
    });

    await conn.commit();

    // Mail AFTER commit
    await sendMail({
      to: email,
      subject: "Your LMS Account Created",
      html: userCreated({ name, user_id, password })
    });

    res.json({ ok: true, message: "User added successfully" });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { adminAddUser };
