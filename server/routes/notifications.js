const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

// All routes here require login
router.get("/", auth, getNotifications);
router.post("/read/:id", auth, markAsRead);
router.post("/read-all", auth, markAllAsRead);

module.exports = router;
