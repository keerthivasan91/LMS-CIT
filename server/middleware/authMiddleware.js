const constants = require('../utils/constants');
const logger = require('../services/logger');

/**
 * Basic authentication middleware
 * Checks if user is logged in
 */
const authMiddleware = (req, res, next) => {
  if (!req.session.user_id) {
    logger.warn('Authentication failed - no session', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(401).json({
      error: constants.MESSAGES.UNAUTHORIZED,
      message: 'Please login to access this resource',
      code: 'UNAUTHENTICATED'
    });
  }

  // Add user info to request for downstream middleware
  req.user = {
    id: req.session.user_id,
    role: req.session.role,
    name: req.session.name,
    department: req.session.department,
    email: req.session.email,
    phone: req.session.phone
  };

  next();
};

/**
 * Optional authentication middleware
 * Doesn't block but adds user info if available
 */
const optionalAuth = (req, res, next) => {
  if (req.session.user_id) {
    req.user = {
      id: req.session.user_id,
      role: req.session.role,
      name: req.session.name,
      department: req.session.department,
      email: req.session.email,
      phone: req.session.phone
    };
  }
  next();
};

/**
 * Session validation middleware
 * Ensures session is still valid and not expired
 */
const sessionValidator = (req, res, next) => {
  if (!req.session.user_id) {
    return next(); // No session, continue (will be caught by authMiddleware if needed)
  }

  // Check if session is about to expire (within 5 minutes)
  const now = Date.now();
  const maxAge = req.session.cookie.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
  const expires = req.session.cookie.expires || new Date(now + maxAge);
  
  if (expires.getTime() - now < 5 * 60 * 1000) { // 5 minutes
    logger.debug('Session nearing expiration', {
      userId: req.session.user_id,
      expiresIn: Math.round((expires.getTime() - now) / 1000 / 60) + ' minutes'
    });
    
    // You could refresh the session here if needed
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  sessionValidator
};