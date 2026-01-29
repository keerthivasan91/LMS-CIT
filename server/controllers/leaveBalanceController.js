const leaveBalanceService = require("../services/leave/leaveBalance.service");

exports.getLeaveBalance = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const balance = await leaveBalanceService.getBalance(
      req.user.user_id,
      year
    );

    res.json({ balance });
  } catch (err) {
    next(err);
  }
};
