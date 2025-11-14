const express = require('express');
const router = express.Router();

const { 
  getBranches, 
  getStaffByBranch 
} = require('../controllers/branchController');

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Get list of departments (faculty, hod, staff, admin → allowed)
router.get('/branches', auth(), getBranches);

// Get staff for a department
router.get('/staff/:branch', auth(), getStaffByBranch);

module.exports = router;
