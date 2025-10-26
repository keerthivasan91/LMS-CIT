const Validators = require('../utils/validators');

const validateLeaveApplication = (req, res, next) => {
  const validation = Validators.validateLeaveApplication(req.body);
  
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }
  
  next();
};

const validateChangePassword = (req, res, next) => {
  const { current_password, new_password, confirm_password } = req.body;
  const errors = [];

  if (!current_password) {
    errors.push('Current password is required');
  }

  if (!new_password) {
    errors.push('New password is required');
  } else if (new_password.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (!confirm_password) {
    errors.push('Confirm password is required');
  }

  if (new_password !== confirm_password) {
    errors.push('New passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { user_id, password } = req.body;
  const errors = [];

  if (!user_id) {
    errors.push('User ID is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateLeaveApplication,
  validateChangePassword,
  validateLogin
};