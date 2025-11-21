const logger = require("../services/logger");
function errorHandler(err, req, res, next) {
  logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

module.exports = { errorHandler };
