const User = require('../models/User');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateChangePassword } = require('../middleware/validateRequest');
const logger = require('../services/logger');
const constants = require('../utils/constants');

const profileController = {
  getStats: asyncHandler(async (req, res) => {
    const user_id = req.session.user_id;
    
    const stats = await Leave.getUserStats(user_id);
    
    res.json({ stats });
  }),

  changePassword: [
    validateChangePassword,
    asyncHandler(async (req, res) => {
      const { current_password, new_password } = req.body;
      const user_id = req.session.user_id;

      const user = await User.findByUserId(user_id);
      
      if (!user || user.password !== current_password) {
        return res.status(400).json({ 
          error: "Current password is incorrect" 
        });
      }

      await User.updatePassword(user_id, new_password);

      logger.audit('password_changed', user_id);

      res.json({ 
        message: constants.MESSAGES.PASSWORD_CHANGED 
      });
    })
  ],

  getHolidays: asyncHandler(async (req, res) => {
    const holidays = await Holiday.findAll();
    res.json({ holidays });
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user_id = req.session.user_id;
    
    const user = await User.findByUserId(user_id);
    const stats = await Leave.getUserStats(user_id);

    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      profile: {
        user_id: user.user_id,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone
      },
      stats
    });
  })
};

module.exports = profileController;