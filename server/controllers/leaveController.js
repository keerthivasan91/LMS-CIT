  const pool = require("../config/db");
  const { sendMail } = require("../services/mail.service");
  const LeaveModel = require("../models/Leave");
  const {
    leaveApplied,
    substituteRequest,
  } = require("../services/mailTemplates/leave.templates");

  /* ============================================================
    APPLY LEAVE
    RULE:
    - Substitute approval required IF substitutes exist
    - Auto-accept ONLY when no substitutes
    - Admin behaves like staff in workflow
  ============================================================ */
  async function applyLeave(req, res, next) {

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

      // -----------------------------
      // Date validation (backend)
      // -----------------------------
      const selectedStart = new Date(start_date);
      selectedStart.setHours(0, 0, 0, 0);

      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() - 3);

      if (selectedStart < minDate) {
        return res.status(400).json({
          message: "Leave cannot be applied for dates older than 3 days"
        });
      }
      const selectedEnd = new Date(end_date);
      selectedEnd.setHours(0, 0, 0, 0);
      if (selectedEnd < selectedStart) {
        return res.status(400).json({
          message: "End date cannot be before start date"
        });
      }


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

        // ✅ Commit first
        await conn.commit();

        /* -----------------------------
          SEND MAILS AFTER COMMIT
        ----------------------------- */
        for (const mail of mailQueue) {
          await sendMail(mail);
        }
        await sendMail({
          to: userEmail,
          subject: "Leave Request Submitted",
          html: leaveApplied({ name: req.user.name, leaveId: leave_id, type: leave_type, startDate: start_date, endDate: end_date })
        });
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
    
    // Extract separate page markers from query
    const appliedPage = parseInt(req.query.appliedPage) || 1;
    const deptPage = parseInt(req.query.deptPage) || 1;
    const instPage = parseInt(req.query.instPage) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const selected_department = req.query.department || null;

    let applied_leaves = [];
    let substitute_requests = [];
    let department_leaves = [];
    let institution_leaves = [];
    let departments = [];

    let applied_total_pages = 0;
    let dept_total_pages = 0;
    let inst_total_pages = 0;

    /* 1. Applied Leaves - Paginated */
    const [[{ totalApplied }]] = await pool.query(
      `SELECT COUNT(*) AS totalApplied FROM leave_requests WHERE user_id = ?`, [user_id]
    );
    applied_total_pages = Math.ceil(totalApplied / limit);
    [applied_leaves] = await pool.query(
      `SELECT lr.*, u.name AS requester_name FROM leave_requests lr 
       JOIN users u ON lr.user_id = u.user_id 
       WHERE lr.user_id = ? ORDER BY lr.applied_on DESC LIMIT ? OFFSET ?`,
      [user_id, limit, (appliedPage - 1) * limit]
    );

    /* 2. Substitute Requests - NO Pagination */
    [substitute_requests] = await pool.query(
      `SELECT a.status AS substitute_status, a.details AS arrangement_details, lr.*, u.name AS requester_name
       FROM arrangements a
       JOIN leave_requests lr ON a.leave_id = lr.leave_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE a.substitute_id = ? ORDER BY lr.start_date DESC`,
      [user_id]
    );

    /* 3. Department Leaves (HOD) - Paginated */
    if (role === "hod") {
      const [[{ totalDept }]] = await pool.query(
        `SELECT COUNT(*) AS totalDept FROM leave_requests lr 
         JOIN users u ON lr.user_id = u.user_id WHERE u.department_code = ?`, [department_code]
      );
      dept_total_pages = Math.ceil(totalDept / limit);
      [department_leaves] = await pool.query(
        `SELECT lr.*, u.name AS requester_name, u.designation 
         FROM leave_requests lr JOIN users u ON lr.user_id = u.user_id 
         WHERE u.department_code = ? ORDER BY lr.applied_on DESC LIMIT ? OFFSET ?`,
        [department_code, limit, (deptPage - 1) * limit]
      );
    }

    /* 4. Institution Leaves (Admin / Principal) - Paginated */
    if (role === "admin" || role === "principal") {
      const [deptRows] = await pool.query(`SELECT department_code FROM departments WHERE is_active = 1`);
      departments = deptRows.map(d => d.department_code);

      let countSql = `SELECT COUNT(*) as totalInst FROM leave_requests lr JOIN users u ON lr.user_id = u.user_id WHERE lr.final_status = 'approved'`;
      let dataSql = `SELECT lr.*, u.name AS requester_name, u.department_code as dept_alias, u.designation 
                     FROM leave_requests lr JOIN users u ON lr.user_id = u.user_id 
                     WHERE lr.final_status = 'approved'`;
      let params = [];

      if (selected_department) {
        countSql += ` AND u.department_code = ?`;
        dataSql += ` AND u.department_code = ?`;
        params.push(selected_department);
      }

      const [[{ totalInst }]] = await pool.query(countSql, params);
      inst_total_pages = Math.ceil(totalInst / limit);

      dataSql += ` ORDER BY lr.applied_on DESC LIMIT ? OFFSET ?`;
      params.push(limit, (instPage - 1) * limit);
      [institution_leaves] = await pool.query(dataSql, params);
    }

    res.json({
      applied_leaves,
      substitute_requests,
      department_leaves,
      institution_leaves,
      departments,
      selected_department,
      pagination: {
        applied_total_pages,
        dept_total_pages,
        inst_total_pages
      }
    });
  } catch (err) { next(err); }
}

  module.exports = {
    applyLeave,
    leaveHistory
  };
