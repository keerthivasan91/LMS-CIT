const express = require("express");
const router = express.Router();

const { requestPasswordReset } = require("../controllers/forgotPasswordRequest");

router.post("/forgot-password-request", requestPasswordReset);

module.exports = router;
