const pool = require("../config/db");
const { sendMail } = require("../services/mail.service");
const LeaveModel = require("../models/Leave");

const leaveApplyService = require("../services/leave/leaveApply.service");
const leaveBalanceService = require("../services/leave/leaveBalance.service");

const {
  leaveApplied,
  substituteRequest,
} = require("../services/mailTemplates/leave.templates");

/* ============================================================
   APPLY LEAVE
============================================================ */
async function applyLeave(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conn = await pool.getConnection();
  const mailQueue = [];

  try {
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

    /* ---------------------------------------------------------
       DATE VALIDATION
    --------------------------------------------------------- */
    const sDate = new Date(start_date);
    const eDate = new Date(end_date);
    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(0, 0, 0, 0);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 3);
    minDate.setHours(0, 0, 0, 0);

    if (sDate < minDate) {
      return res.status(400).json({
        message: "Leave cannot be applied for dates older than 3 days"
      });
    }

    if (eDate < sDate) {
      return res.status(400).json({
        message: "End date cannot be before start date"
      });
    }

    /* ---------------------------------------------------------
       CALCULATE DAYS (for validation only)
    --------------------------------------------------------- */
    let days;
    if (start_date === end_date) {
      days =
        start_session === "Forenoon" && end_session === "Afternoon"
          ? 1
          : 0.5;
    } else {
      days =
        (eDate - sDate) / (1000 * 60 * 60 * 24) + 1 -
        (start_session === "Afternoon" ? 0.5 : 0) -
        (end_session === "Forenoon" ? 0.5 : 0);
    }

    const academic_year = new Date(start_date).getFullYear();

    /* =========================================================
       🔒 TRANSACTION START
    ========================================================= */
    await conn.beginTransaction();

    // ✅ Ensure balance row exists
    await leaveBalanceService.ensureBalanceRow({
      conn,
      user_id: req.user.user_id,
      role: req.user.role,
      academic_year
    });

    // ✅ Validate leave availability
    try {
      await leaveApplyService.beforeApply({
        user: req.user,
        leave_type,
        days,
        start_date,
        end_date
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }


    /* ---------------------------------------------------------
       BUILD ARRANGEMENTS
    --------------------------------------------------------- */
    const rows = [
      { dept: arr1_dept, faculty: arr1_faculty, staff: arr1_staff, details: arr1_details },
      { dept: arr2_dept, faculty: arr2_faculty, staff: arr2_staff, details: arr2_details },
      { dept: arr3_dept, faculty: arr3_faculty, staff: arr3_staff, details: arr3_details },
      { dept: arr4_dept, faculty: arr4_faculty, staff: arr4_staff, details: arr4_details }
    ];

    const arrangements = rows
      .map(r => {
        let substitute = null;

        if (userRole === "faculty" || userRole === "hod") {
          substitute = r.faculty;
        } else if (userRole === "staff" || userRole === "admin") {
          substitute = r.staff || r.faculty;
        }

        if (!substitute || substitute.trim() === "") return null;

        return {
          substitute_id: substitute,
          department_code: r.dept || null,
          details: r.details || null
        };
      })
      .filter(Boolean);

    const hasSubstitutes = arrangements.length > 0;

    /* ---------------------------------------------------------
       INSERT LEAVE
    --------------------------------------------------------- */
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
          html: substituteRequest({
            name: sub.name,
            startDate: start_date,
            endDate: end_date,
            details: arr.details,
            requesterName: req.user.name
          })
        });
      }
    }

    await conn.commit();

    /* ---------------------------------------------------------
       SEND MAILS AFTER COMMIT
    --------------------------------------------------------- */
    for (const mail of mailQueue) {
      await sendMail(mail);
    }

    await sendMail({
      to: userEmail,
      subject: "Leave Request Submitted",
      html: leaveApplied({
        name: req.user.name,
        leaveId: leave_id,
        type: leave_type,
        startDate: start_date,
        endDate: end_date
      })
    });

    res.json({ ok: true, leave_id });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* ============================================================
   LEAVE HISTORY (UNCHANGED)
============================================================ */
async function leaveHistory(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role, user_id, department_code } = req.user;

    const appliedPage = Number(req.query.appliedPage || 1);
    const deptPage = Number(req.query.deptPage || 1);
    const instPage = Number(req.query.instPage || 1);
    const limit = Number(req.query.limit || 10);
    const selected_department = req.query.department || null;

    const pagination = {
      applied_total_pages: 0,
      dept_total_pages: 0,
      inst_total_pages: 0
    };

    let applied_leaves = [];
    let substitute_requests = [];
    let department_leaves = [];
    let institution_leaves = [];
    let departments = [];

    /* ================= APPLIED LEAVES ================= */
    const [[{ totalApplied }]] = await pool.query(
      `SELECT COUNT(*) AS totalApplied FROM leave_requests WHERE user_id = ?`,
      [user_id]
    );

    pagination.applied_total_pages = Math.ceil(totalApplied / limit);

    [applied_leaves] = await pool.query(
      `SELECT *
       FROM leave_requests
       WHERE user_id = ?
       ORDER BY applied_on DESC
       LIMIT ? OFFSET ?`,
      [user_id, limit, (appliedPage - 1) * limit]
    );

    /* ================= SUBSTITUTE REQUESTS ================= */
    [substitute_requests] = await pool.query(
      `SELECT 
        a.arrangement_id,
        a.status AS substitute_status,
        a.details AS arrangement_details,
        lr.leave_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.reason,
        u.user_id AS requester_id,
        u.name AS requester_name,
        u.department_code
      FROM arrangements a
      JOIN leave_requests lr ON a.leave_id = lr.leave_id
      JOIN users u ON lr.user_id = u.user_id
      WHERE a.substitute_id = ?
      ORDER BY lr.start_date DESC`,
      [user_id]
    );

    /* ================= HOD DEPARTMENT LEAVES ================= */
    if (role === "hod") {
      const [[{ totalDept }]] = await pool.query(
        `SELECT COUNT(*) AS totalDept
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         WHERE u.department_code = ?
         AND lr.final_status = 'approved'`,
        [department_code]
      );

      pagination.dept_total_pages = Math.ceil(totalDept / limit);

      [department_leaves] = await pool.query(
        `SELECT lr.*, u.name AS requester_name, u.designation
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.user_id
         WHERE u.department_code = ?
       AND lr.final_status = 'approved'
     ORDER BY lr.applied_on DESC
         LIMIT ? OFFSET ?`,
        [department_code, limit, (deptPage - 1) * limit]
      );
    }

    /* ================= ADMIN / PRINCIPAL INSTITUTION LEAVES ================= */
    if (role === "admin" || role === "principal") {
      const [deptRows] = await pool.query(
        `SELECT department_code FROM departments WHERE is_active = 1`
      );
      departments = deptRows.map(d => d.department_code);

      let countSql = `
        SELECT COUNT(*) AS total
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.user_id
        WHERE lr.final_status = 'approved'
      `;

      const countParams = [];

      if (selected_department) {
        countSql += ` AND u.department_code = ?`;
        countParams.push(selected_department);
      }

      const [[{ total }]] = await pool.query(countSql, countParams);
      pagination.inst_total_pages = Math.ceil(total / limit);

      let dataSql = `
        SELECT lr.*, 
               u.name AS requester_name,
               u.department_code,
               u.designation
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.user_id
        WHERE lr.final_status = 'approved'
      `;

      const dataParams = [];

      if (selected_department) {
        dataSql += ` AND u.department_code = ?`;
        dataParams.push(selected_department);
      }

      dataSql += ` ORDER BY lr.applied_on DESC LIMIT ? OFFSET ?`;
      dataParams.push(limit, (instPage - 1) * limit);

      [institution_leaves] = await pool.query(dataSql, dataParams);
    }

    return res.json({
      applied_leaves,
      substitute_requests,
      department_leaves,
      institution_leaves,
      departments,
      pagination
    });

  } catch (err) {
    next(err);
  }
}



module.exports = {
  applyLeave,
  leaveHistory
};
