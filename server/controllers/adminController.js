// controllers/adminDashboard.js

const AdminModel = require("../models/Admin");
const sendMail = require("../services/mail.service");
const {
  leaveApproved,
  leaveRejected
} = require("../services/mailTemplates/leave.templates");

async function adminDashboard(req, res, next) {
  try {
    if (!["admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const selectedDepartment = req.query.department || null;

    const requests = await AdminModel.getPrincipalPending();
    const institution_leaves = await AdminModel.getInstitutionLeaves(
      selectedDepartment
    );

    res.json({ requests, institution_leaves });

  } catch (err) {
    next(err);
  }
}

async function approvePrincipal(req, res, next) {
  try {
    const leaveId = req.params.rid;
    const applicant = await AdminModel.getApplicantEmail(leaveId);

    if (!applicant) {
      return res.status(404).json({ message: "Leave not found" });
    }

    await AdminModel.approveLeavePrincipal(leaveId);

    res.json({ ok: true });

    await sendMail({
      to: applicant.email,
      subject: "Leave Approved By Principal",
      html: leaveApproved({ leaveId })
    });

  } catch (err) {
    next(err);
  }
}

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
      subject: "Leave rejected By Principal",
      html: leaveRejected({ leaveId })
    });

  } catch (err) {
    next(err);
  }
}

async function adminGetUsers(req, res, next) {
  try {
    const users = await AdminModel.getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = { adminGetUsers };


module.exports = {
  adminDashboard,
  approvePrincipal,
  rejectPrincipal,
  adminGetUsers
};
