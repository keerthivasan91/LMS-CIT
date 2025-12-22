/**
 * Workflow Transition Templates
 */

const APP_URL = "https://d31bsugjsi7j8z.cloudfront.net/login";
const PRIMARY_COLOR = "#2563eb"; // Brand Blue
const SUCCESS_COLOR = "#16a34a"; // Workflow Green
const DANGER_COLOR = "#dc2626";  // Workflow Red

// Reusable Layout Helper
const emailLayout = (content, accentColor = PRIMARY_COLOR) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: ${accentColor}; padding: 15px; text-align: center; color: white; font-weight: bold; letter-spacing: 1px;">
      LMS WORKFLOW UPDATE
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
      ${content}
      <div style="margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <a href="${APP_URL}/my-requests" style="display: inline-block; background-color: ${accentColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Request Status</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
      This is a system-generated notification regarding Leave ID: #${Date.now().toString().slice(-6)}
    </div>
  </div>
`;

module.exports = {
  /**
   * Triggered when all designated substitutes have agreed to cover the shift
   */
  substituteAcceptedAll: ({ name, nextStage }) => {
    return emailLayout(`
      <h2 style="color: #1e293b; margin-top: 0;">Substitute Coverage Confirmed</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We are pleased to inform you that all nominated substitutes have <strong>accepted</strong> your coverage requests.</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid ${SUCCESS_COLOR}; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #166534;">
          <strong>Current Progress:</strong> Substitution Phase Complete<br>
          <strong>Next Action:</strong> Your request has been forwarded to <strong>${nextStage}</strong> for final approval.
        </p>
      </div>
      
      <p>No further action is required from your side at this stage.</p>
    `, SUCCESS_COLOR);
  },

  /**
   * Triggered if a substitute declines, usually resulting in an auto-rejection
   */
  substituteRejected: ({ name }) => {
    return emailLayout(`
      <h2 style="color: #1e293b; margin-top: 0;">Request Update: Substitute Declined</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your leave request has been <strong>declined</strong> because a designated substitute was unable to accept the coverage request.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid ${DANGER_COLOR}; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b;">
          <strong>Status:</strong> Request Rejected<br>
        </p>
      </div>
      
      <p>Please coordinate with the Faculty and submit a new request with an alternative substitute if required.</p>
    `, DANGER_COLOR);
  }
};