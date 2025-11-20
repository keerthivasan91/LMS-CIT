const express = require("express");
const router = express.Router();
const sessionAuth = require("../middleware/sessionAuth");
const { requestPasswordReset } = require("../controllers/forgotPasswordRequest");

router.post("/forgot-password-request", sessionAuth, requestPasswordReset);

module.exports = router;
