const express = require("express");
const sessionAuth = require("../middleware/sessionAuth");
const router = express.Router();
const { changePassword } = require("../controllers/changePasswordController");

router.post("/change-password",  sessionAuth, changePassword);

module.exports = router;
