const express = require("express");
const router = express.Router();
const sessionAuth = require("../middleware/authMiddleware");

const notificationCounters = require("../controllers/notificationController");

// ✔ THIS ROUTE SHOULD BE ONLY "/"
router.get("/", sessionAuth(), notificationCounters);

module.exports = router;
