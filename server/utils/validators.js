const constants = require('./constants');

class Validators {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  static validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static validateLeaveDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return { valid: false, error: 'End date cannot be before start date' };
    }
    
    if (start < new Date()) {
      return { valid: false, error: 'Cannot apply for leave in the past' };
    }
    
    return { valid: true };
  }

  static validateLeaveType(leaveType) {
    const validTypes = Object.values(constants.LEAVE_TYPES);
    return validTypes.includes(leaveType);
  }

  static validateSession(session) {
    const validSessions = Object.values(constants.SESSIONS);
    return validSessions.includes(session);
  }

  static validateRole(role) {
    const validRoles = Object.values(constants.ROLES);
    return validRoles.includes(role);
  }

  static validateLeaveApplication(data) {
    const errors = [];

    if (!data.leave_type || !this.validateLeaveType(data.leave_type)) {
      errors.push('Invalid leave type');
    }

    if (!data.start_date || !this.validateDate(data.start_date)) {
      errors.push('Invalid start date');
    }

    if (!data.end_date || !this.validateDate(data.end_date)) {
      errors.push('Invalid end date');
    }

    if (data.start_date && data.end_date) {
      const dateValidation = this.validateLeaveDates(data.start_date, data.end_date);
      if (!dateValidation.valid) {
        errors.push(dateValidation.error);
      }
    }

    if (!data.start_session || !this.validateSession(data.start_session)) {
      errors.push('Invalid start session');
    }

    if (!data.end_session || !this.validateSession(data.end_session)) {
      errors.push('Invalid end session');
    }

    if (!data.reason || data.reason.trim().length < 5) {
      errors.push('Reason must be at least 5 characters long');
    }

    if (!data.days || data.days < 1) {
      errors.push('Days must be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;