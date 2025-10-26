const Leave = require('../models/Leave');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../services/logger');
const constants = require('../utils/constants');

const hodController = {
  getDashboard: asyncHandler(async (req, res) => {
    const department = req.session.department;
    
    const requests = await Leave.findPendingHOD(department);
    
    res.json({ 
      requests, 
      department 
    });
  }),

  getLeaveBalance: asyncHandler(async (req, res) => {
    const department = req.session.department;
    
    const leave_balances = await Leave.getDepartmentStats(department);
    
    res.json({ 
      leave_balances, 
      department 
    });
  }),

  approveLeave: asyncHandler(async (req, res) => {
    const request_id = req.params.id;
    const user_id = req.session.user_id;

    await Leave.updateHODStatus(request_id, 'Approved');

    logger.audit('hod_approve', user_id, { request_id });

    res.json({ message: "Leave approved by HOD" });
  }),

  rejectLeave: asyncHandler(async (req, res) => {
    const request_id = req.params.id;
    const user_id = req.session.user_id;

    await Leave.updateHODStatus(request_id, 'Rejected');
    await Leave.updateFinalStatus(request_id, 'Rejected');

    logger.audit('hod_reject', user_id, { request_id });

    res.json({ message: "Leave rejected by HOD" });
  })
};

module.exports = hodController;