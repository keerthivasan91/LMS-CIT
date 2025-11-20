const express = require('express');
const router = express.Router();
const { getHolidays } = require('../controllers/holidaycontroller');
const sessionAuth = require('../middleware/sessionAuth');

router.get('/',sessionAuth, getHolidays);

module.exports = router;
