const express = require('express');
const router = express.Router();

const { 
  getBranches, 
  getAllBranches,
  getStaffByBranch 
} = require('../controllers/branchController');

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Departments list for everyone who needs it
router.get('/branches', auth(), getBranches);

// Full departments list for admin/principal
router.get('/departments', auth(), role(["admin", "principal"]), getAllBranches);

// Staff list based on department
router.get('/staff/:branch', auth(), getStaffByBranch);

module.exports = router;
