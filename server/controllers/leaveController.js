// controllers/leaveController.js
const pool = require("../config/db");
const sendMail = require("../config/mailer");
const LeaveModel = require("../models/Leave");

/* ============================================================
   APPLY LEAVE  (MULTI SUBSTITUTE)
============================================================ */
async function applyLeave(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user_id = req.user.user_id;
    const department_code = req.user.department_code;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    const {
      leave_type = "Casual Leave",
      start_date,
      start_session = "Forenoon",
      end_date,
      end_session = "Afternoon",
      reason = "",

      arr1_dept, arr1_faculty, arr1_staff, arr1_details,
      arr2_dept, arr2_faculty, arr2_staff, arr2_details,
      arr3_dept, arr3_faculty, arr3_staff, arr3_details,
      arr4_dept, arr4_faculty, arr4_staff, arr4_details
    } = req.body;

    // -----------------------------
    // Build arrangement list
    // -----------------------------
    const rows = [
      { dept: arr1_dept, faculty: arr1_faculty, staff: arr1_staff, details: arr1_details },
      { dept: arr2_dept, faculty: arr2_faculty, staff: arr2_staff, details: arr2_details },
      { dept: arr3_dept, faculty: arr3_faculty, staff: arr3_staff, details: arr3_details },
      { dept: arr4_dept, faculty: arr4_faculty, staff: arr4_staff, details: arr4_details }
    ];

    const arrangements = rows
      .map((r) => {
        const substitute = (userRole === "staff") ? r.staff : r.faculty;
        // More strict check for empty values
        if (!substitute || substitute === "" || substitute === "0") return null;

        return {
          substitute_id: substitute,
          department_code: r.dept || null,
          details: r.details || null
        };
      })
      .filter(Boolean);

    const hasSubstitutes = arrangements.length > 0;

    // -----------------------------
    // DB Transaction
    // -----------------------------
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // -----------------------------
      // Insert main leave request
      // -----------------------------
      const leave_id = await LeaveModel.insertLeaveRequest(conn, {
        user_id,
        department_code,
        leave_type,
        start_date,
        start_session,
        end_date,
        end_session,
        reason,
        hasSubstitutes,
        userRole
      });

      // -----------------------------
      // Insert arrangement rows
      // -----------------------------
      for (const arr of arrangements) {
        await LeaveModel.insertArrangement(
          conn,
          leave_id,
          arr.substitute_id,
          arr.details,
          arr.department_code
        );

        // Email each substitute
        const sub = await LeaveModel.getSubstituteDetails(arr.substitute_id);

        if (sub?.email) {
          sendMail(
            sub.email,
            "Substitute Request Assigned",
            `<p>You have been requested to substitute from <b>${start_date}</b> to <b>${end_date}</b>.</p>
             <p><b>Leave ID:</b> ${leave_id}</p>
             <p><b>Details:</b> ${arr.details || "No details provided"}</p>
             <p>Please accept or reject this request in the FLMS portal.</p>`
          );
        }
      }

      // Commit DB changes
      await conn.commit();

      // Send applicant email
      sendMail(
        userEmail,
        "Leave Request Submitted",
        `<p>Your leave request (ID:<b>${leave_id}</b>) has been submitted successfully.</p>`
      );

      return res.json({ ok: true, leave_id });

    } catch (err) {
      await conn.rollback();
      return next(err);
    } finally {
      conn.release();
    }

  } catch (err) {
    return next(err);
  }
}


/* ============================================================
   LEAVE HISTORY (UPDATED FOR NEW SCHEMA)
============================================================ */
async function leaveHistory(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { role, user_id, department_code } = req.user;
    const selected_department = req.query.department || null;

    /* ============================================================
       1. APPLIED LEAVES  → leaves applied by this user
    ============================================================ */
    const applied_leaves = await pool.query(
      `SELECT lr.*, u.name AS requester_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.user_id = ?
       ORDER BY lr.applied_on DESC`,
      [user_id]
    ).then(([rows]) => rows);

    /* ============================================================
       2. SUBSTITUTE REQUESTS → from ARRANGEMENTS table
    ============================================================ */
    const substitute_requests = await pool.query(
      `SELECT 
          a.arrangement_id,
          a.leave_id,
          a.status AS substitute_status,
          a.details AS arrangement_details,
          a.responded_on,
          lr.start_date, lr.end_date,
          lr.start_session, lr.end_session,
          lr.reason, lr.leave_type,
          u.name AS requester_name,
          u.email AS requester_email,
          u.phone AS requester_phone
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.substitute_id = ?
       ORDER BY a.arrangement_id DESC`,
      [user_id]
    ).then(([rows]) => rows);

    /* ============================================================
       3. DEPARTMENT LEAVES (HOD only)
    ============================================================ */
    let department_leaves = [];
    if (role === "hod") {
      department_leaves = await pool.query(
        `SELECT lr.*, u.name AS requester_name , u.department_code , u.designation
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         WHERE u.department_code = ?
         ORDER BY lr.applied_on DESC`,
        [department_code]
      ).then(([rows]) => rows);
    }

    /* ============================================================
       4. INSTITUTION LEAVES (ADMIN/PRINCIPAL)
    ============================================================ */
    let institution_leaves = [];
    let departments = [];

    if (role === "admin" || role === "principal") {
      departments = await pool.query(
        `SELECT DISTINCT department_code FROM users`
      ).then(([rows]) => rows.map(r => r.department_code));

      institution_leaves = await pool.query(
        `SELECT lr.*, u.name AS requester_name, u.department_code, u.designation
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         ${selected_department ? "WHERE u.department_code = ?" : ""}
         ORDER BY lr.applied_on DESC`,
        selected_department ? [selected_department] : []
      ).then(([rows]) => rows);
    }

    res.json({
      applied_leaves,
      substitute_requests,
      department_leaves,
      institution_leaves,
      departments,
      selected_department
    });

  } catch (err) {
    next(err);
  }
}


module.exports = {
  applyLeave,
  leaveHistory
};
