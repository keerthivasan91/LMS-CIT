module.exports = {
  ROLES: {
    FACULTY: 'faculty',
    HOD: 'hod',
    PRINCIPAL: 'principal',
    ADMIN: 'admin',
    STAFF: 'staff'
  },

  LEAVE_TYPES: {
    CASUAL: 'Casual',
    SICK: 'Sick',
    EARNED: 'Earned',
    MATERNITY: 'Maternity',
    PATERNITY: 'Paternity',
    STUDY: 'Study',
    OTHER: 'Other'
  },

  SESSIONS: {
    FORENOON: 'Forenoon',
    AFTERNOON: 'Afternoon',
    FULL_DAY: 'Full Day'
  },

  STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled'
  },

  SUBSTITUTE_STATUS: {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    NOT_APPLICABLE: 'Not Applicable'
  },

  NOTIFICATION_TYPES: {
    LEAVE_APPLIED: 'leave_applied',
    SUBSTITUTE_REQUEST: 'substitute_request',
    LEAVE_APPROVED: 'leave_approved',
    LEAVE_REJECTED: 'leave_rejected',
    SUBSTITUTE_ACCEPTED: 'substitute_accepted',
    SUBSTITUTE_REJECTED: 'substitute_rejected'
  },

  // Leave limits
  LEAVE_LIMITS: {
    CASUAL_PER_SEMESTER: 15,
    SICK_PER_YEAR: 30,
    EARNED_PER_YEAR: 45
  },

  // Response messages
  MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    LEAVE_APPLIED_SUCCESS: 'Leave application submitted successfully',
    SUBSTITUTE_ACCEPTED: 'Substitute request accepted',
    SUBSTITUTE_REJECTED: 'Substitute request rejected',
    PASSWORD_CHANGED: 'Password changed successfully'
  }
};