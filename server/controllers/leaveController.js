const Leave = require('../models/Leave');
const Substitute = require('../models/Substitute');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateLeaveApplication } = require('../middleware/validateRequest');
const logger = require('../services/logger');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const constants = require('../utils/constants');

const leaveController = {
  apply: [
    validateLeaveApplication,
    asyncHandler(async (req, res) => {
      const {
        leave_type, start_date, start_session, end_date, end_session,
        reason, arrangement_details, days, substitute_user_id
      } = req.body;

      const user_id = req.session.user_id;
      const role = req.session.role;
      const department = req.session.department;

      // Determine substitute status
      let substitute_status = 'Not Applicable';
      let final_substitute_user_id = null;

      if (role === 'faculty' && substitute_user_id) {
        substitute_status = 'Pending';
        final_substitute_user_id = substitute_user_id;
      }

      const leaveData = {
        user_id,
        department,
        leave_type,
        start_date,
        start_session,
        end_date,
        end_session,
        reason,
        days: parseInt(days) || 1,
        substitute_user_id: final_substitute_user_id,
        substitute_status,
        arrangement_details
      };

      const leaveId = await Leave.create(leaveData);

      // Create substitute request if applicable
      if (role === 'faculty' && substitute_user_id) {
        await Substitute.create({
          leave_request_id: leaveId,
          requested_user_id: substitute_user_id,
          arrangement_details
        });

        // TODO: Send notification to substitute
      }

      logger.audit('leave_applied', user_id, { leaveId, leave_type, days });

      res.json({
        message: constants.MESSAGES.LEAVE_APPLIED_SUCCESS,
        leave_id: leaveId
      });
    })
  ],

  getHistory: asyncHandler(async (req, res) => {
    const user_id = req.session.user_id;
    const role = req.session.role;
    const department = req.session.department;
    const selected_department = req.query.department;

    const result = {};

    // Applied leaves
    result.applied_leaves = await Leave.findByUserId(user_id);

    // Substitute requests
    result.substitute_requests = await Substitute.findByRequestedUserId(user_id);

    // Department leaves (HOD only)
    if (role === 'hod') {
      result.department_leaves = await Leave.findByDepartment(department);
    }

    // Institution leaves (Principal/Admin only)
    if (role === 'admin' || role === 'principal') {
      result.institution_leaves = await Leave.findAll(selected_department);
      
      // Get departments for filter
      const User = require('../models/User');
      result.departments = await User.getBranches();
    }

    res.json(result);
  }),

  getSubstituteRequests: asyncHandler(async (req, res) => {
    const user_id = req.session.user_id;
    const requests = await Substitute.findByRequestedUserId(user_id, 'Pending');
    res.json({ requests });
  }),

  acceptSubstitute: asyncHandler(async (req, res) => {
    const request_id = req.params.id;
    const user_id = req.session.user_id;

    // Update substitute request status
    await Substitute.updateStatus(request_id, 'Accepted');
    
    // Update leave substitute status
    await Substitute.updateLeaveSubstituteStatus(request_id, 'Accepted');

    logger.audit('substitute_accepted', user_id, { request_id });

    res.json({ message: constants.MESSAGES.SUBSTITUTE_ACCEPTED });
  }),

  rejectSubstitute: asyncHandler(async (req, res) => {
    const request_id = req.params.id;
    const user_id = req.session.user_id;

    // Update substitute request status
    await Substitute.updateStatus(request_id, 'Rejected');
    
    // Update leave substitute status and final status
    await Substitute.updateLeaveSubstituteStatus(request_id, 'Rejected');
    // Also update final status to rejected
    // This would require additional logic to get the leave ID

    logger.audit('substitute_rejected', user_id, { request_id });

    res.json({ message: constants.MESSAGES.SUBSTITUTE_REJECTED });
  })
};

module.exports = leaveController;