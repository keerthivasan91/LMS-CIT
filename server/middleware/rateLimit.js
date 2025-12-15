const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req); // ✅ IPv4 + IPv6 safe
    const user =
      req.body?.email ||
      req.body?.user_id ||
      req.body?.username ;

    return `${ip}-${user}`;
  },

  message: {
    error: "Too many login attempts for this account. Try again later."
  }
});

module.exports =  loginLimiter ;
