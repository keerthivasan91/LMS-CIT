const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');

const { 
  getBranches, 
  getAllBranches,
  getStaffByBranch 
} = require('../controllers/branchController');

const role = require('../middleware/roleMiddleware');

// Departments list for everyone who needs it
router.get('/branches', sessionAuth, getBranches);

// Full departments list for admin/principal
router.get('/departments', sessionAuth, role(["admin", "principal"]), getAllBranches);

// Staff list based on department
router.get('/staff/:branch', sessionAuth, getStaffByBranch);

module.exports = router;
