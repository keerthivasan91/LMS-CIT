const { LEAVE_TYPES, SESSIONS } = require("./constants");

module.exports = {
  isValidDate(date) {
    return !isNaN(new Date(date).getTime());
  },

  isValidLeaveType(type) {
    return LEAVE_TYPES.includes(type);
  },

  isValidSession(session) {
    return (
      session === SESSIONS.FORENOON ||
      session === SESSIONS.AFTERNOON
    );
  },

  isNonEmptyString(str) {
    return typeof str === "string" && str.trim() !== "";
  },

  isPositiveInt(n) {
    return Number.isInteger(n) && n > 0;
  }
};
