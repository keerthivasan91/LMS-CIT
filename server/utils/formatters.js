class Formatters {
  static formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  static formatDateTime(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  static formatLeaveStatus(status) {
    const statusMap = {
      'Pending': 'Pending',
      'Approved': 'Approved',
      'Rejected': 'Rejected',
      'Cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
  }

  static formatSubstituteStatus(status) {
    const statusMap = {
      'Pending': 'Pending Response',
      'Accepted': 'Accepted',
      'Rejected': 'Rejected',
      'Not Applicable': 'Not Required'
    };
    
    return statusMap[status] || status;
  }

  static formatRole(role) {
    const roleMap = {
      'faculty': 'Faculty',
      'hod': 'HOD',
      'principal': 'Principal',
      'admin': 'Admin',
      'staff': 'Staff'
    };
    
    return roleMap[role] || role;
  }

  static formatLeaveType(leaveType) {
    const typeMap = {
      'Casual': 'Casual Leave',
      'Sick': 'Sick Leave',
      'Earned': 'Earned Leave',
      'Maternity': 'Maternity Leave',
      'Paternity': 'Paternity Leave',
      'Study': 'Study Leave',
      'Other': 'Other Leave'
    };
    
    return typeMap[leaveType] || leaveType;
  }

  static formatSession(session) {
    const sessionMap = {
      'Forenoon': 'FN',
      'Afternoon': 'AN',
      'Full Day': 'Full Day'
    };
    
    return sessionMap[session] || session;
  }

  static capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  static truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
}

module.exports = Formatters;