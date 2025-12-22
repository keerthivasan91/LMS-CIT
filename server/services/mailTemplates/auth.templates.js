const { sendMail } = require("../mail.service");

/**
 * Template for when a user changes their own password
 */
function passwordChanged({ name }) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">Security Notification</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>This is a confirmation that the password for your <strong>Leave Management System (LMS)</strong> account has been successfully changed.</p>
        <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; border-left: 5px solid #ffa500; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Didn't make this change?</strong><br>
                If you did not authorize this, please contact System Administrator immediately to secure your account.
            </p>
        </div>
        <p>Best regards,<br>LMS CIT</p>
    </div>
    `;
}

/**
 * Template for when an Admin resets a user's password
 */
async function passwordResetByAdminMail(user, password) {
    if (!user.email) return;
    
    const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2c3e50;">Account Password Reset</h2>
        <p>Hello ${user.name || 'Team Member'},</p>
        <p>Your password for the <strong>Leave Management System</strong> has been reset by an administrator.</p>
        
        <div style="text-align: center; background-color: #f9f9f9; padding: 20px; border: 1px dashed #ccc; margin: 20px 0;">
            <p style="margin-bottom: 10px;">Your temporary password is:</p>
            <span style="font-family: monospace; font-size: 1.2rem; font-weight: bold; color: #e74c3c;">${password}</span>
        </div>

        <p>For security purposes, you are required to change this temporary password immediately after logging in.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://d31bsugjsi7j8z.cloudfront.net/login" 
               style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Login to LMS
            </a>
        </div>

        <p style="font-size: 12px; color: #999;">
            Note: This is an automated message. Please do not reply directly to this email.
        </p>
    </div>
    `;

    return sendMail({
        to: user.email,
        subject: "LMS Security: Password Reset by Admin",
        html: htmlContent
    });
}

module.exports = {
    passwordChanged,
    passwordResetByAdminMail,
};