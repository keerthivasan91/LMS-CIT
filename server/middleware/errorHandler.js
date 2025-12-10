const logger = require("../services/logger");
function errorHandler(err, req, res, next) {
  logger.error(err.stack); // Log full error

  const status = err.status || 500;
  
  // Production: Hide sensitive details
  if (process.env.NODE_ENV === 'production') {
    res.status(status).json({ 
      error: 'Server error occurred',
      requestId: req.id // For support tracking
    });
  } else {
    // Development: Show full error
    res.status(status).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
}
module.exports = { errorHandler };
