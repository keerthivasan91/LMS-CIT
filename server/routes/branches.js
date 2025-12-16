const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/authMiddleware');

const { 
  getAllBranches,
  getBranches,
  getStaffByBranch,
  getFacultyByBranch
} = require('../controllers/branchController');


// ------------------------------------------------------------
// 1) Get All Departments (For Everyone Logged In)
// ------------------------------------------------------------
router.get('/branches', sessionAuth(), getBranches);

// Full departments list for admin/principal
router.get('/departments', sessionAuth(["admin", "principal"]), getAllBranches);


// ------------------------------------------------------------
// 2) Get STAFF Only by Department
//    Used by staff applying for leave
// ------------------------------------------------------------
router.get('/staff/:branch', sessionAuth(["staff","admin"]), getStaffByBranch);


// ------------------------------------------------------------
// 3) Get FACULTY + HOD by Department
//    Used when faculty/hod select substitute
// ------------------------------------------------------------
router.get('/faculty/:branch', sessionAuth(["faculty", "hod"]), getFacultyByBranch);


module.exports = router;
