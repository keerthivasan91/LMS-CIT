const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendLeaveNotification(toEmail, leaveDetails) {
    const { requesterName, leaveType, startDate, endDate, days, reason } = leaveDetails;
    
    const subject = `Leave Application - ${requesterName}`;
    const html = `
      <h2>Leave Application Submitted</h2>
      <p><strong>Requester:</strong> ${requesterName}</p>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>Duration:</strong> ${startDate} to ${endDate} (${days} days)</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please check the LMS portal for more details.</p>
    `;

    return await this.sendEmail(toEmail, subject, html);
  }

  async sendSubstituteRequest(toEmail, requestDetails) {
    const { requesterName, leaveType, startDate, endDate, arrangementDetails } = requestDetails;
    
    const subject = `Substitute Request - ${requesterName}`;
    const html = `
      <h2>Substitute Request</h2>
      <p><strong>Requester:</strong> ${requesterName}</p>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>Duration:</strong> ${startDate} to ${endDate}</p>
      <p><strong>Arrangement Details:</strong> ${arrangementDetails}</p>
      <p>Please respond to this request in the LMS portal.</p>
    `;

    return await this.sendEmail(toEmail, subject, html);
  }

  async sendApprovalNotification(toEmail, approvalDetails) {
    const { approverName, leaveType, startDate, endDate, status } = approvalDetails;
    
    const subject = `Leave ${status} - ${leaveType}`;
    const html = `
      <h2>Leave Request ${status}</h2>
      <p><strong>Approved By:</strong> ${approverName}</p>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>Duration:</strong> ${startDate} to ${endDate}</p>
      <p>Your leave request has been <strong>${status.toLowerCase()}</strong>.</p>
    `;

    return await this.sendEmail(toEmail, subject, html);
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email service not configured. Skipping email send.');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();