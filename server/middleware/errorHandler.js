const logger = require('../services/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.session?.user_id
  });

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      error: 'Invalid reference',
      message: 'Referenced record does not exist'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please login again'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please login again'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};