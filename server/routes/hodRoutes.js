const express = require('express');
const router = express.Router();
const db = require('../config/db');

// HOD dashboard
router.get('/dashboard', async (req, res) => {
  try {
    if (req.session.role !== 'hod') {
      return res.status(403).json({ error: "Access denied" });
    }

    const dept = req.session.department;
    
    const [requests] = await db.execute(
      `SELECT lr.id, lr.user_id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, lr.final_status, 
              lr.applied_at, u1.name as requester_name, u2.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE lr.department=? AND lr.substitute_status IN ('Accepted','Not Applicable') AND lr.hod_status='Pending'
       ORDER BY lr.applied_at DESC`,
      [dept]
    );

    res.json({ requests, department: dept });
  } catch (error) {
    console.error('HOD dashboard error:', error);
    res.status(500).json({ error: "Failed to fetch HOD dashboard data" });
  }
});

// HOD leave balance
router.get('/leave-balance', async (req, res) => {
  try {
    if (req.session.role !== 'hod') {
      return res.status(403).json({ error: "Access denied" });
    }

    const dept = req.session.department;
    
    const [leaveBalances] = await db.execute(
      `SELECT u.name,
              COUNT(lr.id) AS total,
              SUM(lr.final_status='Approved') AS approved,
              SUM(lr.final_status='Rejected') AS rejected,
              SUM(lr.final_status='Pending') AS pending,
              COALESCE(SUM(lr.days),0) AS total_days
       FROM users u
       LEFT JOIN leave_requests lr ON u.user_id=lr.user_id
       WHERE u.department=? AND u.role IN ('faculty','staff')
       GROUP BY u.user_id, u.name
       ORDER BY u.name`,
      [dept]
    );

    res.json({ leave_balances: leaveBalances, department: dept });
  } catch (error) {
    console.error('HOD leave balance error:', error);
    res.status(500).json({ error: "Failed to fetch leave balance data" });
  }
});

// Approve HOD request
router.post('/approve/:id', async (req, res) => {
  try {
    if (req.session.role !== 'hod') {
      return res.status(403).json({ error: "Access denied" });
    }

    const request_id = req.params.id;
    
    await db.execute(
      "UPDATE leave_requests SET hod_status='Approved', hod_responded_at=NOW() WHERE id=?",
      [request_id]
    );

    res.json({ message: "Leave approved by HOD" });
  } catch (error) {
    console.error('HOD approve error:', error);
    res.status(500).json({ error: "Failed to approve leave" });
  }
});

// Reject HOD request
router.post('/reject/:id', async (req, res) => {
  try {
    if (req.session.role !== 'hod') {
      return res.status(403).json({ error: "Access denied" });
    }

    const request_id = req.params.id;
    
    await db.execute(
      "UPDATE leave_requests SET hod_status='Rejected', hod_responded_at=NOW(), final_status='Rejected' WHERE id=?",
      [request_id]
    );

    res.json({ message: "Leave rejected by HOD" });
  } catch (error) {
    console.error('HOD reject error:', error);
    res.status(500).json({ error: "Failed to reject leave" });
  }
});

module.exports = router;