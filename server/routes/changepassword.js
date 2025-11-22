const express = require("express");
const sessionAuth = require("../middleware/authMiddleware");
const router = express.Router();
const { changePassword } = require("../controllers/changePasswordController");

router.post("/change-password",  sessionAuth(["admin","principal","staff","faculty","hod"]), changePassword);

module.exports = router;
