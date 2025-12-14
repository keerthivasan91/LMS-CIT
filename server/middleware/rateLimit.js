const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  message: "Too many requests. Please slow down."
});

module.exports = apiLimiter;
