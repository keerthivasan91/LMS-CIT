const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateLogin } = require('../middleware/validateRequest');
const logger = require('../services/logger');
const constants = require('../utils/constants');

const authController = {
  login: [
    validateLogin,
    asyncHandler(async (req, res) => {
      const { user_id, password } = req.body;

      const user = await User.findByCredentials(user_id, password);
      
      if (!user) {
        logger.warn('Failed login attempt', { user_id });
        return res.status(401).json({ 
          error: constants.MESSAGES.INVALID_CREDENTIALS 
        });
      }

      // Set session
      req.session.user_id = user.user_id;
      req.session.role = user.role;
      req.session.name = user.name;
      req.session.department = user.department;
      req.session.email = user.email;
      req.session.phone = user.phone;

      logger.audit('login', user.user_id, { role: user.role });

      res.json({
        message: "Login successful",
        user: {
          user_id: user.user_id,
          role: user.role,
          name: user.name,
          department: user.department,
          email: user.email,
          phone: user.phone
        }
      });
    })
  ],

  logout: asyncHandler(async (req, res) => {
    const userId = req.session.user_id;
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Logout error', { userId, error: err.message });
        return res.status(500).json({ error: "Logout failed" });
      }
      
      logger.audit('logout', userId);
      res.json({ message: "Logout successful" });
    });
  }),

  getBranches: asyncHandler(async (req, res) => {
    const branches = await User.getBranches();
    res.json({ branches });
  }),

  getStaffByBranch: asyncHandler(async (req, res) => {
    const { branch } = req.params;
    const staff = await User.getStaffByBranch(branch);
    res.json({ staff });
  }),

  getSession: asyncHandler(async (req, res) => {
    if (!req.session.user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      user: {
        user_id: req.session.user_id,
        role: req.session.role,
        name: req.session.name,
        department: req.session.department,
        email: req.session.email,
        phone: req.session.phone
      }
    });
  })
};

module.exports = authController;