const leaveBalanceService = require("./leaveBalance.service");
const { validateLeave } = require("./leaveValidation.service");

exports.beforeApply = async ({ user, leave_type, days, start_date }) => {
  if (!user || !leave_type || !start_date) {
    throw new Error("Invalid leave request data");
  }

  if (!days || days <= 0) {
    throw new Error("Leave duration must be greater than zero");
  }

  // Admin / Principal → no balance logic
  if (["admin", "principal"].includes(user.role)) {
    return;
  }

  const year = new Date(start_date).getFullYear();

  const balance = await leaveBalanceService.getBalance(
    user.user_id,
    year
  );

  if (!balance) {
    throw new Error("Leave balance not initialized for this user");
  }

  validateLeave({
    leaveType: leave_type,
    days,
    balance,
    role: user.role
  });
};
