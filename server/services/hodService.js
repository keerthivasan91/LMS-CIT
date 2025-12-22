const LeaveModel = require("../models/Leave");
const {sendMail} = require("./mail.service");
const { hodApproved, hodRejected } = require("./mailTemplates/leave.templates");

async function approveLeave(leaveId) {
    const applicant = await LeaveModel.getApplicantDetails(leaveId);
    if (!applicant) throw new Error("Leave record not found");

    // 1. Update DB Status
    await LeaveModel.updateHodStatus(leaveId, "approved");

    // 2. Send Industry-Standard Email
    try {
        await sendMail({
            to: applicant.email,
            subject: `Leave Update [ID: #${leaveId}]: Approved by HOD`,
            html: hodApproved({ name: applicant.name, leaveId: leaveId })
        });
    } catch (mailError) {
        console.error("Email failed to send, but DB was updated:", mailError);
    }

    return { success: true, message: "Leave approved and forwarded to Principal" };
}

async function rejectLeave(leaveId) {
    const applicant = await LeaveModel.getApplicantDetails(leaveId);
    if (!applicant) throw new Error("Leave record not found");

    // 1. Update DB Status
    await LeaveModel.updateHodStatus(leaveId, "rejected");

    // 2. Send Industry-Standard Email
    try {
        await sendMail({
            to: applicant.email,
            subject: `Leave Update [ID: #${leaveId}]: Rejected by HOD`,
            html: hodRejected({ name: applicant.name, leaveId: leaveId })
        });
    } catch (mailError) {
        console.error("Email failed to send:", mailError);
    }

    return { success: true, message: "Leave rejection recorded" };
}

module.exports = { approveLeave, rejectLeave };