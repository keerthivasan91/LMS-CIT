// server/middleware/roleMiddleware.js

/**
 * Restrict access to one or more roles
 * Usage:
 *   router.get("/admin", auth(), role(["admin"]), controller)
 *
 * @param {Array<String>} allowedRoles
 * @returns middleware function
 */
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found in request" });
      }

      // If user.role not available
      const userRole = req.user.role;
      if (!userRole) {
        return res.status(403).json({ message: "Forbidden: Role missing" });
      }

      // Check authorization
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to perform this action"
        });
      }

      next();
    } catch (err) {
      console.error("Role middleware error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = roleMiddleware;
