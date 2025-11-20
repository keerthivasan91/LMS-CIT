const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/changePasswordController");

router.post("/change-password", auth(), changePassword);

module.exports = router;
