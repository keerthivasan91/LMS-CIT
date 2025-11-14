const express = require('express');
const router = express.Router();
const { getHolidays } = require('../controllers/holidaycontroller');
const auth = require('../middleware/authMiddleware')();

router.get('/', auth, getHolidays);

module.exports = router;
