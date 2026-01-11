// controllers/adminController.js

const AdminModel = require("../models/Admin");
const { sendMail } = require("../services/mail.service");
const { leaveApproved, leaveRejected } = require("../services/mailTemplates/leave.templates");

/* ================= ADMIN DASHBOARD ================= */

async function adminDashboard(req, res, next) {
  try {
    if (!["admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const selectedDepartment = req.query.department || null;

    const requests = await AdminModel.getPrincipalPending();
    const institution_leaves = await AdminModel.getInstitutionLeaves(selectedDepartment);

    res.json({ requests, institution_leaves });
  } catch (err) {
    next(err);
  }
}

/* ================= APPROVE / REJECT ================= */

async function approvePrincipal(req, res, next) {
  try {
    const leaveId = req.params.rid;
    const applicant = await AdminModel.getApplicantEmail(leaveId);
    if (!applicant) return res.status(404).json({ message: "Leave not found" });

    await AdminModel.approveLeavePrincipal(leaveId);
    res.json({ ok: true });

    await sendMail({
      to: applicant.email,
      subject: "Leave Approved By Principal",
      html: leaveApproved({ name: applicant.name, leaveId })
    });
  } catch (err) {
    next(err);
  }
}

async function rejectPrincipal(req, res, next) {
  try {
    const leaveId = req.params.rid;
    const applicant = await AdminModel.getApplicantEmail(leaveId);
    if (!applicant) return res.status(404).json({ message: "Leave not found" });

    await AdminModel.rejectLeavePrincipal(leaveId);
    res.json({ ok: true });

    await sendMail({
      to: applicant.email,
      subject: "Leave Rejected By Principal",
      html: leaveRejected({ name: applicant.name, leaveId })
    });
  } catch (err) {
    next(err);
  }
}

/* ================= VIEW USERS ================= */

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


/* ================= VIEW USER PROFILE ================= */

async function adminViewUserProfile(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userId = req.params.userId;
    const user = await AdminModel.getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function approveBulk(req, res, next) {
  try {
    const { leaveIds } = req.body;

    for (const leaveId of leaveIds) {
      // 1. Approve leave
      await AdminModel.approveLeavePrincipal(leaveId);

      // 2. Get applicant details
      const applicant = await AdminModel.getApplicantEmail(leaveId);

      // 3. Send mail
      if (applicant?.email) {
        await sendMail({
          to: applicant.email,
          subject: "Leave Approved By Principal",
          html: leaveApproved({
            name: applicant.name,
            leaveId
          })
        });
      }
    }

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
}

async function rejectBulk(req, res, next) {
  try {
    const { leaveIds } = req.body;

    for (const leaveId of leaveIds) {
      // 1. Reject leave
      await AdminModel.rejectLeavePrincipal(leaveId);

      // 2. Get applicant details
      const applicant = await AdminModel.getApplicantEmail(leaveId);

      // 3. Send mail
      if (applicant?.email) {
        await sendMail({
          to: applicant.email,
          subject: "Leave Rejected By Principal",
          html: leaveRejected({
            name: applicant.name,
            leaveId
          })
        });
      }
    }

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
}


/* ================= EXPORTS ================= */

module.exports = {
  adminDashboard,
  approvePrincipal,
  rejectPrincipal,
  approveBulk,
  rejectBulk,
  adminViewUsers,
  adminViewUserProfile
};
