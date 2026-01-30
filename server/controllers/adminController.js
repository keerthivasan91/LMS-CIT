// controllers/adminController.js

const pool = require("../config/db");
const AdminModel = require("../models/Admin");
const LeaveModel = require("../models/Leave");

const leaveBalance = require("../services/leave/leaveBalance.service");
const { sendMail } = require("../services/mail.service");
const {
  leaveApproved,
  leaveRejected
} = require("../services/mailTemplates/leave.templates");

const LeaveReportService = require("../services/reports/leaveReport.service");
const PdfService = require("../services/reports/pdf.service");
const ExcelService = require("../services/reports/excel.service");

/* ================= ADMIN DASHBOARD ================= */

async function adminDashboard(req, res, next) {
  try {
    if (!["admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const department = req.query.department || null;

    const requests = await AdminModel.getPrincipalPending();
    const institution_leaves = await AdminModel.getInstitutionLeaves(department);

    res.json({ requests, institution_leaves });
  } catch (err) {
    next(err);
  }
}

/* ================= PRINCIPAL APPROVAL ================= */

async function approvePrincipal(req, res, next) {
  const leaveId = req.params.rid;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const leave = await LeaveModel.getLeaveById(leaveId);
    if (!leave) {
      conn.release();
      return res.status(404).json({ message: "Leave not found" });
    }

    const academic_year = new Date(leave.start_date).getFullYear();

    // 1️⃣ Ensure balance row exists
    await leaveBalance.ensureBalanceRow({
      conn,
      user_id: leave.user_id,
      role: leave.requester_role,
      academic_year
    });


    // 3️⃣ Approve leave
    await AdminModel.approveLeavePrincipalTx(conn, leaveId);

    // 4️⃣ Deduct balance
    await leaveBalance.deduct({
      conn,
      user_id: leave.user_id,
      leave_type: leave.leave_type,
      days: leave.days,
      academic_year
    });

    await conn.commit();
    res.json({ ok: true });

    // Mail AFTER commit
    await sendMail({
      to: leave.requester_email,
      subject: "Leave Approved By Principal",
      html: leaveApproved({
        name: leave.requester_name,
        leaveId
      })
    });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* ================= PRINCIPAL REJECTION ================= */

async function rejectPrincipal(req, res, next) {
  try {
    const leaveId = req.params.rid;
    const applicant = await AdminModel.getApplicantEmail(leaveId);

    if (!applicant) {
      return res.status(404).json({ message: "Leave not found" });
    }

    await AdminModel.rejectLeavePrincipal(leaveId);
    res.json({ ok: true });

    await sendMail({
      to: applicant.email,
      subject: "Leave Rejected By Principal",
      html: leaveRejected({
        name: applicant.name,
        leaveId
      })
    });

  } catch (err) {
    next(err);
  }
}

/* ================= BULK APPROVAL ================= */

async function approveBulk(req, res, next) {
  const { leaveIds } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    for (const leaveId of leaveIds) {
      const leave = await LeaveModel.getLeaveById(leaveId);
      if (!leave) continue;

      const academic_year = new Date(leave.start_date).getFullYear();

      await leaveBalance.ensureBalanceRow({
        conn,
        user_id: leave.user_id,
        role: leave.requester_role,
        academic_year
      });


      await AdminModel.approveLeavePrincipalTx(conn, leaveId);

      await leaveBalance.deduct({
        conn,
        user_id: leave.user_id,
        leave_type: leave.leave_type,
        days: leave.days,
        academic_year
      });
    }

    await conn.commit();
    res.json({ ok: true });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/* ================= BULK REJECT ================= */

async function rejectBulk(req, res, next) {
  try {
    const { leaveIds } = req.body;

    for (const leaveId of leaveIds) {
      await AdminModel.rejectLeavePrincipal(leaveId);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ================= REPORTS ================= */

async function downloadLeaveHistory(req, res) {
  const { docType, department, startDate, endDate } = req.query;

  const data = await LeaveReportService.getLeaveHistory({
    department,
    startDate,
    endDate
  });

  if (docType === "pdf") {
    return PdfService.generatePDF(res, data, { department, startDate, endDate });
  }

  if (docType === "excel") {
    return ExcelService.generateExcel(res, data, { department, startDate, endDate });
  }

  res.status(400).json({ message: "Invalid document type" });
}

/* ================= USERS ================= */

async function adminViewUsers(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const department = req.query.department || "";

    const { users, total } = await AdminModel.getUsers({
      search,
      department,
      limit,
      offset
    });

    const departments = await AdminModel.getDepartments();

    res.json({
      users,
      departments,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function adminViewUserProfile(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await AdminModel.getUserProfileById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/* ================= EXPORT ================= */

module.exports = {
  adminDashboard,
  approvePrincipal,
  rejectPrincipal,
  approveBulk,
  rejectBulk,
  adminViewUsers,
  adminViewUserProfile,
  downloadLeaveHistory
};
