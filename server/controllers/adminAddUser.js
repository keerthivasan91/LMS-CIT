    const bcrypt = require("bcryptjs");
    const pool = require("../config/db");
    const sendMail = require("../config/mailer");

    /* ===========================================================
    ADMIN ADD USER CONTROLLER
    Only admin/principal can add new users
    =========================================================== */
    async function adminAddUser(req, res, next) {
    try {
        // Permission check
        if (!req.user || (req.user.role !== "admin" && req.user.role !== "principal")) {
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

        /* -----------------------------------------------------------
        VALIDATION
        ----------------------------------------------------------- */
        if (!user_id || !name || !email || !role) {
        return res.status(400).json({ message: "Missing required fields" });
        }

        if (role !== "admin" && role !== "principal" && !department_code) {
        return res.status(400).json({
            message: "Department required for faculty, hod, staff"
        });
        }

        // Auto-generate password if empty
        const finalPassword = password ;
        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        /* -----------------------------------------------------------
        CHECK IF USER ALREADY EXISTS
        ----------------------------------------------------------- */
        const [exists] = await pool.query(
        "SELECT user_id FROM users WHERE user_id = ? OR email = ? LIMIT 1",
        [user_id, email]
        );

        if (exists.length) {
        return res.status(409).json({ message: "User already exists" });
        }

        /* -----------------------------------------------------------
        INSERT NEW USER
        ----------------------------------------------------------- */
        await pool.query(
        `INSERT INTO users 
            (user_id, name, email, phone, role, department_code,designation, date_joined, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            name,
            email,
            phone || null,
            role,
            department_code || null,
            desc || null,
            date_of_joining || null,
            hashedPassword]
        );

        /* -----------------------------------------------------------
        SEND EMAIL WITH LOGIN DETAILS
        ----------------------------------------------------------- */
        await sendMail(
        email,
        "Your LMS Account Created",
        `
            <h2>Welcome, ${name}</h2>
            <p>Your account has been created in the Leave Management System.</p>
            <p><b>User ID:</b> ${user_id}</p>
            <p><b>Password:</b> ${finalPassword}</p>
            <p>Please login and change your password.</p>
        `
        );

        /* -----------------------------------------------------------
        RESPONSE
        ----------------------------------------------------------- */
        res.json({
        ok: true,
        message: "User added successfully",
        user_id,
        password: finalPassword
        });

    } catch (err) {
        console.error("Admin Add User Error:", err);
        next(err);
    }
    }

    module.exports = { adminAddUser };
