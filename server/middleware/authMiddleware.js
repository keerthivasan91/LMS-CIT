const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      if (!token) return res.status(401).json({ message: 'Missing token' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // { user_id, role, name, department, email, phone, iat, exp }

      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = authMiddleware;
