const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendLeaveSMS(toPhone, leaveDetails) {
    const { requesterName, leaveType, startDate, endDate } = leaveDetails;
    
    const message = `Leave Application: ${requesterName} applied for ${leaveType} leave from ${startDate} to ${endDate}. Check LMS for details.`;
    
    return await this.sendSMS(toPhone, message);
  }

  async sendSubstituteSMS(toPhone, requestDetails) {
    const { requesterName, leaveType, startDate, endDate } = requestDetails;
    
    const message = `Substitute Request: ${requesterName} needs substitute for ${leaveType} leave (${startDate} to ${endDate}). Please respond in LMS.`;
    
    return await this.sendSMS(toPhone, message);
  }

  async sendApprovalSMS(toPhone, approvalDetails) {
    const { leaveType, status } = approvalDetails;
    
    const message = `Leave Update: Your ${leaveType} leave has been ${status.toLowerCase()}. Check LMS for details.`;
    
    return await this.sendSMS(toPhone, message);
  }

  async sendSMS(to, body) {
    try {
      if (!this.client) {
        console.log('SMS service not configured. Skipping SMS send.');
        return { success: false, message: 'SMS service not configured' };
      }

      const message = await this.client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      console.log('SMS sent successfully:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();