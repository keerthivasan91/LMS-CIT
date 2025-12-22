/**
 * Welcome & Onboarding Template
 */

const APP_URL = "https://d31bsugjsi7j8z.cloudfront.net/login";
const PRIMARY_COLOR = "#2563eb";

// Reusable Layout Helper
const emailLayout = (content) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: ${PRIMARY_COLOR}; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to LMS</h1>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      ${content}
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      © ${new Date().getFullYear()} Your Company Name. All rights reserved.
    </div>
  </div>
`;

function userCreated({ name, user_id, password }) {
  return emailLayout(`
    <h2 style="color: #1e293b; margin-top: 0;">Hi ${name || 'there'},</h2>
    <p>Your account for the <strong>Leave Management System</strong> has been successfully created. You can now log in to manage your leave requests, track approvals, and view your Academic calendar.</p>
    
    <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <p style="margin-top: 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Your Credentials</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Username:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e293b;">${user_id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Temporary Password:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e293b;">${password}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/login" 
         style="background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
         Log In & Set Your Password
      </a>
    </div>

    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Security Tip:</strong> For your protection, you will be prompted to change this temporary password immediately upon your first login.
      </p>
    </div>
  `);
}

module.exports = { userCreated };