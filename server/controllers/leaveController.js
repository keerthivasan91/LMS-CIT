const pool = require("../config/db");
const sendMail = require("../config/mailer");
const LeaveModel = require("../models/Leave");

/* ============================================================
   APPLY LEAVE
   RULE:
   - Substitute approval required IF substitutes exist
   - Auto-accept ONLY when no substitutes
   - Admin behaves like staff in workflow
============================================================ */
async function applyLeave(req, res, next) {
  console.log("REQ BODY:", req.body);

  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { user_id, department_code, email: userEmail, role: userRole } = req.user;

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

    /* -----------------------------
       Build arrangements
    ----------------------------- */
    const rows = [
      { dept: arr1_dept, faculty: arr1_faculty, staff: arr1_staff, details: arr1_details },
      { dept: arr2_dept, faculty: arr2_faculty, staff: arr2_staff, details: arr2_details },
      { dept: arr3_dept, faculty: arr3_faculty, staff: arr3_staff, details: arr3_details },
      { dept: arr4_dept, faculty: arr4_faculty, staff: arr4_staff, details: arr4_details }
    ];

    const arrangements = rows
      .map(r => {
        let substitute = null;

        // Faculty/HOD → faculty substitutes
        if (userRole === "faculty" || userRole === "hod") {
          substitute = r.faculty;
        }
        // Staff/Admin → staff substitutes
        else if (userRole === "staff" || userRole === "admin") {
          substitute = r.staff || r.faculty; // staff can pick faculty if needed
        }

        if (!substitute || substitute.trim() === "") return null;

        return {
          substitute_id: substitute, // users.user_id
          department_code: r.dept || null,
          details: r.details || null
        };
      })
      .filter(Boolean);

    const hasSubstitutes = arrangements.length > 0;
    console.log("ARRANGEMENTS:", arrangements);
console.log("hasSubstitutes:", hasSubstitutes);


    /* -----------------------------
       DB TRANSACTION
    ----------------------------- */
    const conn = await pool.getConnection();
    const mailQueue = [];

    try {
      await conn.beginTransaction();

      // Insert leave request
      const leave_id = await LeaveModel.insertLeaveRequest(conn, {
        user_id,
        department_code,
        leave_type,
        start_date,
        start_session,
        end_date,
        end_session,
        reason,
        hasSubstitutes, // 🔑 ONLY THIS decides auto-accept
        userRole
      });

      // Insert arrangements (no mail here)
      for (const arr of arrangements) {
        await LeaveModel.insertArrangement(
          conn,
          leave_id,
          arr.substitute_id,
          arr.details,
          arr.department_code
        );

        const sub = await LeaveModel.getSubstituteDetails(arr.substitute_id);
        if (sub?.email) {
          mailQueue.push({
            to: sub.email,
            subject: "Substitute Request Assigned",
            body: `
              <p>You have been requested to substitute from <b>${start_date}</b> to <b>${end_date}</b>.</p>
              <p><b>Leave ID:</b> ${leave_id}</p>
              <p><b>Details:</b> ${arr.details || "No details provided"}</p>
              <p>Please accept or reject this request in the FLMS portal.</p>
            `
          });
        }
      }

      // ✅ Commit first
      await conn.commit();

      /* -----------------------------
         SEND MAILS AFTER COMMIT
      ----------------------------- */
      for (const mail of mailQueue) {
        sendMail(mail.to, mail.subject, mail.body);
      }

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
   LEAVE HISTORY
============================================================ */
async function leaveHistory(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { role, user_id, department_code } = req.user;
    const selected_department = req.query.department || null;

    // Applied leaves
    const [applied_leaves] = await pool.query(
      `SELECT lr.*, u.name AS requester_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.user_id = ?
       ORDER BY lr.applied_on DESC`,
      [user_id]
    );

    // Substitute requests
    const [substitute_requests] = await pool.query(
      `SELECT a.arrangement_id, a.leave_id, a.status AS substitute_status,
              a.details AS arrangement_details, a.responded_on,
              lr.start_date, lr.end_date, lr.start_session, lr.end_session,
              lr.reason, lr.leave_type,
              u.name AS requester_name, u.email AS requester_email, u.phone AS requester_phone
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.substitute_id = ?
       ORDER BY a.arrangement_id DESC`,
      [user_id]
    );

    // Department leaves (HOD)
    let department_leaves = [];
    if (role === "hod") {
      const [rows] = await pool.query(
        `SELECT lr.*, u.name AS requester_name, u.department_code, u.designation
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         WHERE u.department_code = ?
         ORDER BY lr.applied_on DESC`,
        [department_code]
      );
      department_leaves = rows;
    }

    // Institution leaves (Admin / Principal)
    let institution_leaves = [];
    let departments = [];

    if (role === "admin" || role === "principal") {
      const [deptRows] = await pool.query(
        `SELECT DISTINCT department_code FROM users`
      );
      departments = deptRows.map(d => d.department_code);

      const [rows] = await pool.query(
        `SELECT lr.*, u.name AS requester_name, u.department_code, u.designation
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         ${selected_department ? "WHERE u.department_code = ?" : ""}
         ORDER BY lr.applied_on DESC`,
        selected_department ? [selected_department] : []
      );
      institution_leaves = rows;
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
