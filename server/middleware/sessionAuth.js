module.exports = function sessionAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = req.session.user; // attach user for convenience
  next();
};
