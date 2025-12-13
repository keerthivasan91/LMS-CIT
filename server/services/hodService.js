const LeaveModel = require("../models/Leave");
const sendMail = require("../config/mailer");

async function approveLeave(leaveId) {
  const applicant = await LeaveModel.getApplicantDetails(leaveId);
  if (!applicant) throw new Error("Leave not found");

  await LeaveModel.updateHodStatus(leaveId, "approved");

  // Send mail
  await sendMail(
    applicant.email,
    "Leave Approved by HOD",
    `
      <h2>Hello ${applicant.name},</h2>
      <p>Your leave request has been <b>approved by the HOD</b>.</p>
      <p>It has been forwarded to the Principal.</p>
    `
  );

  return true;
}

async function rejectLeave(leaveId) {
  const applicant = await LeaveModel.getLeaveApplicant(leaveId);
  if (!applicant) throw new Error("Leave not found");

  await LeaveModel.updateHodStatus(leaveId, "rejected");

  // Send mail
  await sendMail(
    applicant.email,
    "Leave Rejected by HOD",
    `
      <h2>Hello ${applicant.name},</h2>
      <p>Your leave request has been <b>rejected by the HOD</b>.</p>
      <p>This decision is final.</p>
    `
  );

  return true;
}

module.exports = {
  approveLeave,
  rejectLeave,
};
