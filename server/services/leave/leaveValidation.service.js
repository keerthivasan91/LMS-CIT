const policy = require("../../policies/leave.policy");

exports.validateLeave = ({ leaveType, days, balance, role }) => {
  const map = {
    "Casual Leave": "CL",
    "Restricted Holiday": "RH",
    "Earned Leave": "EL"
  };

  const code = map[leaveType];
  if (!code) return; // OOD, LOP etc.

  const rules = policy[code];

  if (!balance) {
    throw new Error("Leave balance not initialized");
  }

  if (code === "CL" && balance.casual_used + days > balance.casual_total) {
        throw new Error("Casual Leave exhausted");
  }

  if (code === "RH") {
    if (days > 1) {
      throw new Error("Restricted Holiday can be applied only for 1 day");
    }
    if (balance.rh_used >= balance.rh_total) {
      throw new Error("Restricted Holiday exhausted");
    }
  }

  if (code === "EL" && balance.earned_used + days > balance.earned_total) {
        throw new Error("Earned Leave exhausted");
  }
};
