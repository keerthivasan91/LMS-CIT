const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Principal/Admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    if (req.session.role !== 'admin' && req.session.role !== 'principal') {
      return res.status(403).json({ error: "Access denied" });
    }

    const selected_department = req.query.department;

    // Get pending requests for principal approval
    const [pendingRequests] = await db.execute(
      `SELECT lr.id, lr.user_id, lr.department, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, lr.principal_status, lr.final_status, 
              lr.applied_at, u1.name as requester_name, u2.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u1 ON lr.user_id = u1.user_id
       LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
       WHERE lr.hod_status='Approved' AND lr.principal_status='Pending'
       ORDER BY lr.applied_at DESC`
    );

    // Get all institution leaves (with optional department filter)
    let query = `
      SELECT lr.*, u1.name, u2.name as substitute_name 
      FROM leave_requests lr 
      LEFT JOIN users u1 ON lr.user_id = u1.user_id 
      LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
    `;
    const params = [];
    
    if (selected_department) {
      query += " WHERE lr.department=?";
      params.push(selected_department);
    }
    
    query += " ORDER BY lr.applied_at DESC";
    
    const [institutionLeaves] = await db.execute(query, params);

    // Get departments for filter
    const [departments] = await db.execute("SELECT DISTINCT department FROM users WHERE role='faculty'");

    res.json({
      pending_requests: pendingRequests,
      institution_leaves: institutionLeaves,
      departments: departments.map(d => d.department),
      selected_department: selected_department || ''
    });

  } catch (error) {
    console.error('Principal dashboard error:', error);
    res.status(500).json({ error: "Failed to fetch principal dashboard data" });
  }
});

// Approve principal request
router.post('/approve/:id', async (req, res) => {
  try {
    if (req.session.role !== 'admin' && req.session.role !== 'principal') {
      return res.status(403).json({ error: "Access denied" });
    }

    const request_id = req.params.id;
    
    await db.execute(
      "UPDATE leave_requests SET principal_status='Approved', principal_responded_at=NOW(), final_status='Approved' WHERE id=?",
      [request_id]
    );

    res.json({ message: "Leave approved by Principal" });
  } catch (error) {
    console.error('Principal approve error:', error);
    res.status(500).json({ error: "Failed to approve leave" });
  }
});

// Reject principal request
router.post('/reject/:id', async (req, res) => {
  try {
    if (req.session.role !== 'admin' && req.session.role !== 'principal') {
      return res.status(403).json({ error: "Access denied" });
    }

    const request_id = req.params.id;
    
    await db.execute(
      "UPDATE leave_requests SET principal_status='Rejected', principal_responded_at=NOW(), final_status='Rejected' WHERE id=?",
      [request_id]
    );

    res.json({ message: "Leave rejected by Principal" });
  } catch (error) {
    console.error('Principal reject error:', error);
    res.status(500).json({ error: "Failed to reject leave" });
  }
});

module.exports = router;