const express = require("express");
const router = express.Router();
const sessionAuth = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

// All routes here require login
router.get("/", sessionAuth(), getNotifications);
router.post("/read/:id", sessionAuth(), markAsRead);
router.post("/read-all", sessionAuth(), markAllAsRead);

module.exports = router;
