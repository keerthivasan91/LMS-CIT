/**
 * Industry-standard email templates for Leave Management System (LMS)
 */

const APP_URL = "https://d31bsugjsi7j8z.cloudfront.net"; 
const PRIMARY_COLOR = "#2563eb"; // Corporate Blue
const SUCCESS_COLOR = "#16a34a"; // Success Green
const DANGER_COLOR = "#dc2626";  // Error Red

/**
 * Global Helper for consistent layout
 * @param {string} content - The body of the email
 * @param {string} accentColor - The header background color
 */
const emailLayout = (content, accentColor = PRIMARY_COLOR) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background-color: ${accentColor}; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 1px;">Leave Management System</h1>
    </div>
    <div style="padding: 30px; line-height: 1.6; color: #334155;">
      ${content}
      <div style="margin-top: 30px; text-align: center;">
        <a href="${APP_URL}/dashboard" style="background-color: ${accentColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Dashboard</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
      <p style="margin: 0;">This is an automated notification from your institution's LMS.</p>
      <p style="margin: 5px 0 0;">Please do not reply directly to this email.</p>
    </div>
  </div>
`;

// --- AUTH & ACCOUNT TEMPLATES ---

function userCreated({ name, user_id, password }) {
  return emailLayout(`
    <h3 style="color: #1e293b;">Welcome to LMS, ${name || 'Team Member'}</h3>
    <p>Your official account has been created. Use the credentials below to log in:</p>
    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
        <strong>Username:</strong> ${user_id}<br>
        <strong>Temporary Password:</strong> ${password}
    </div>
    <p style="color: #92400e; font-size: 14px; background: #fffbeb; padding: 10px; border-left: 4px solid #f59e0b;">
        <strong>Note:</strong> You will be required to change this password upon your first login for security purposes.
    </p>
  `);
}

// --- LEAVE STATUS TEMPLATES ---

function leaveApplied({ name, leaveId, type, startDate, endDate }) {
  return emailLayout(`
    <h3 style="color: #1e293b;">Application Submitted</h3>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your leave request has been successfully submitted and is currently <strong>Pending Approval</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f1f5f9; border-radius: 8px; overflow: hidden;">
      <tr><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Request ID:</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">#${leaveId}</td></tr>
      <tr><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Leave Type:</strong></td><td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${type || 'N/A'}</td></tr>
      <tr><td style="padding: 12px;"><strong>Duration:</strong></td><td style="padding: 12px;">${startDate} to ${endDate}</td></tr>
    </table>
    <p>You will be notified as your request progresses through the approval stages.</p>
  `);
}

function leaveApproved({ name, leaveId }) {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; border: 1px solid #166534;">FINAL APPROVAL</span>
    </div>
    <h3 style="color: #1e293b;">Leave Request Approved</h3>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Great news! Your leave request <strong>(ID: #${leaveId})</strong> has been granted final approval by the <strong>Principal</strong>.</p>
    <p>Your leave balance has been adjusted accordingly. Enjoy your time off!</p>
  `, SUCCESS_COLOR);
}

function leaveRejected({ name, leaveId, reason }) {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background: #fee2e2; color: #991b1b; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; border: 1px solid #991b1b;">DECLINED</span>
    </div>
    <h3 style="color: #1e293b;">Request Update</h3>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your leave request <strong>(ID: #${leaveId})</strong> was not approved by the Principal at this time.</p>
    ${reason ? `<div style="background: #f8fafc; padding: 10px; border-left: 3px solid #cbd5e1; margin: 15px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
    <p>Please consult with your department head for further details.</p>
  `, DANGER_COLOR);
}

// --- HOD SPECIFIC TEMPLATES ---

const hodApproved = ({ name, leaveId }) => emailLayout(`
  <h3 style="color: #1e293b;">Departmental Approval Granted</h3>
  <p>Hello <strong>${name}</strong>,</p>
  <p>Your leave request <strong>(ID: #${leaveId})</strong> has been <strong>approved</strong> by your HOD.</p>
  <div style="background-color: #eff6ff; border-left: 4px solid ${PRIMARY_COLOR}; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #1e40af;">
      <strong>Current Status:</strong> Forwarded to Principal<br>
      <strong>Stage:</strong> Final Approval Pending
    </p>
  </div>
`);

const hodRejected = ({ name, leaveId }) => emailLayout(`
  <h3 style="color: #991b1b;">Request Declined by Department</h3>
  <p>Hello <strong>${name}</strong>,</p>
  <p>Your leave request <strong>(ID: #${leaveId})</strong> was declined by your Head of Department.</p>
  <p>This request has been closed and will not be forwarded to the Principal's office.</p>
`, DANGER_COLOR);

// --- SUBSTITUTION TEMPLATES ---

function substituteRequest({ name, startDate, endDate, details, requesterName }) {
  return emailLayout(`
    <h3 style="color: #1e293b;">Action Required: Substitute Request</h3>
    <p>Hello <strong>${name}</strong>,</p>
    <p><strong>${requesterName}</strong> has requested you to act as their substitute.</p>
    <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0; background-color: #f8fafc;">
      <p style="margin: 5px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <p style="margin: 5px 0;"><strong>Instructions:</strong> ${details || "Standard handover protocols apply."}</p>
    </div>
    <p>Please log in to accept or decline this responsibility.</p>
  `);
}

module.exports = {
  userCreated,
  leaveApplied,
  leaveApproved,
  leaveRejected,
  substituteRequest,
  hodApproved,
  hodRejected
};