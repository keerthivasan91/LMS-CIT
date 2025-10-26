const constants = require('../utils/constants');
const logger = require('../services/logger');

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.session.user_id) {
      logger.warn('Role middleware: Unauthenticated access attempt', {
        path: req.path,
        method: req.method,
        allowedRoles
      });
      
      return res.status(401).json({
        error: constants.MESSAGES.UNAUTHORIZED,
        message: 'Please login to access this resource',
        code: 'UNAUTHENTICATED'
      });
    }

    const userRole = req.session.role;
    const userId = req.session.user_id;

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Role middleware: Insufficient permissions', {
        userId,
        userRole,
        allowedRoles,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        error: constants.MESSAGES.FORBIDDEN,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        yourRole: userRole,
        requiredRoles: allowedRoles
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

    logger.debug('Role middleware: Access granted', {
      userId,
      userRole,
      path: req.path
    });

    next();
  };
};

/**
 * Middleware for faculty role only
 */
const facultyOnly = roleMiddleware([constants.ROLES.FACULTY]);

/**
 * Middleware for HOD role only
 */
const hodOnly = roleMiddleware([constants.ROLES.HOD]);

/**
 * Middleware for principal role only
 */
const principalOnly = roleMiddleware([constants.ROLES.PRINCIPAL]);

/**
 * Middleware for admin role only
 */
const adminOnly = roleMiddleware([constants.ROLES.ADMIN]);

/**
 * Middleware for staff role only
 */
const staffOnly = roleMiddleware([constants.ROLES.STAFF]);

/**
 * Middleware for HOD and principal roles
 */
const hodAndPrincipal = roleMiddleware([constants.ROLES.HOD, constants.ROLES.PRINCIPAL]);

/**
 * Middleware for principal and admin roles
 */
const principalAndAdmin = roleMiddleware([constants.ROLES.PRINCIPAL, constants.ROLES.ADMIN]);

/**
 * Middleware for all authenticated users (any role except public)
 */
const anyAuthenticated = roleMiddleware([
  constants.ROLES.FACULTY,
  constants.ROLES.HOD,
  constants.ROLES.PRINCIPAL,
  constants.ROLES.ADMIN,
  constants.ROLES.STAFF
]);

/**
 * Dynamic role middleware that can be configured per route
 * @param {Object} config - Configuration object for role checks
 * @param {Array} config.roles - Allowed roles
 * @param {Boolean} config.allowSelf - Allow users to access their own resources
 * @param {String} config.idParam - Request parameter name for user ID comparison
 */
const dynamicRoleMiddleware = (config = {}) => {
  const {
    roles = [],
    allowSelf = false,
    idParam = 'userId'
  } = config;

  return (req, res, next) => {
    // Check authentication
    if (!req.session.user_id) {
      return res.status(401).json({
        error: constants.MESSAGES.UNAUTHORIZED,
        message: 'Please login to access this resource'
      });
    }

    const userRole = req.session.role;
    const userId = req.session.user_id;

    // Check if user has one of the allowed roles
    const hasRoleAccess = roles.length === 0 || roles.includes(userRole);

    // Check if user is accessing their own resource (if allowSelf is true)
    const isSelfAccess = allowSelf && req.params[idParam] === userId;

    if (!hasRoleAccess && !isSelfAccess) {
      logger.warn('Dynamic role middleware: Access denied', {
        userId,
        userRole,
        allowedRoles: roles,
        isSelfAccess,
        path: req.path
      });

      return res.status(403).json({
        error: constants.MESSAGES.FORBIDDEN,
        message: 'You do not have permission to access this resource',
        yourRole: userRole,
        requiredRoles: roles
      });
    }

    // Add user info to request
    req.user = {
      id: userId,
      role: userRole,
      name: req.session.name,
      department: req.session.department,
      email: req.session.email,
      phone: req.session.phone
    };

    next();
  };
};

/**
 * Department-based access control
 * @param {String} departmentParam - Request parameter name for department
 */
const departmentAccess = (departmentParam = 'department') => {
  return (req, res, next) => {
    const userDepartment = req.session.department;
    const userRole = req.session.role;
    
    // Allow access if user is admin/principal or if department matches
    if ([constants.ROLES.ADMIN, constants.ROLES.PRINCIPAL].includes(userRole)) {
      return next();
    }

    const targetDepartment = req.params[departmentParam] || req.body[departmentParam];
    
    if (userDepartment !== targetDepartment) {
      logger.warn('Department access denied', {
        userId: req.session.user_id,
        userDepartment,
        targetDepartment,
        path: req.path
      });

      return res.status(403).json({
        error: constants.MESSAGES.FORBIDDEN,
        message: 'You can only access resources from your own department'
      });
    }

    next();
  };
};

module.exports = {
  roleMiddleware,
  facultyOnly,
  hodOnly,
  principalOnly,
  adminOnly,
  staffOnly,
  hodAndPrincipal,
  principalAndAdmin,
  anyAuthenticated,
  dynamicRoleMiddleware,
  departmentAccess
};