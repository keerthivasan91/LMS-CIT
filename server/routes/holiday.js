const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/authMiddleware');
const {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday
} = require("../controllers/holidaycontroller");

router.get('/',sessionAuth(), getHolidays);

// Admin
router.post("/", sessionAuth(["admin"]), addHoliday);
router.put("/:id", sessionAuth(["admin"]), updateHoliday);
router.delete("/:id", sessionAuth(["admin"]), deleteHoliday);

module.exports = router;
