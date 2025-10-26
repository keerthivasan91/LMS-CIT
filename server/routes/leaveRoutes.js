const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Apply for leave
router.post('/apply', async (req, res) => {
  try {
    const { 
      leave_type, 
      start_date, 
      start_session, 
      end_date, 
      end_session, 
      reason, 
      arrangement_details, 
      days, 
      substitute_user_id 
    } = req.body;

    const user_id = req.session.user_id;
    const role = req.session.role;
    const department = req.session.department;

    // Determine substitute_status
    let sub_status = 'Not Applicable';
    let final_substitute_user_id = null;

    if (role === 'faculty' && substitute_user_id) {
      sub_status = 'Pending';
      final_substitute_user_id = substitute_user_id;
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert leave request
      const [result] = await connection.execute(
        `INSERT INTO leave_requests 
        (user_id, department, leave_type, start_date, start_session, end_date, end_session,
         reason, days, substitute_user_id, substitute_status, arrangement_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, department, leave_type, start_date, start_session, end_date, end_session,
         reason, days, final_substitute_user_id, sub_status, arrangement_details]
      );

      const leave_id = result.insertId;

      // Create substitute request if applicable
      if (role === 'faculty' && substitute_user_id) {
        await connection.execute(
          `INSERT INTO substitute_requests
          (leave_request_id, requested_user_id, arrangement_details)
          VALUES (?, ?, ?)`,
          [leave_id, substitute_user_id, arrangement_details]
        );
      }

      await connection.commit();
      res.json({ message: "Leave application submitted successfully", leave_id });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ error: "Failed to submit leave application" });
  }
});

// Get leave history
router.get('/history', async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const role = req.session.role;
    const department = req.session.department;
    const selected_department = req.query.department;

    const result = {};

    // 1. Leaves applied by user
    const [appliedLeaves] = await db.execute(
      `SELECT lr.id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
              lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, 
              lr.principal_status, lr.final_status, lr.applied_at, u.name as substitute_name
       FROM leave_requests lr 
       LEFT JOIN users u ON lr.substitute_user_id = u.user_id 
       WHERE lr.user_id=? 
       ORDER BY lr.applied_at DESC 
       LIMIT 20`,
      [user_id]
    );
    result.applied_leaves = appliedLeaves;

    // 2. Substitute requests for user
    const [substituteRequests] = await db.execute(
      `SELECT sr.id, lr.id as leave_id, lr.user_id, lr.leave_type, lr.start_date, lr.end_date, 
              lr.days, lr.reason, sr.status, sr.responded_at, u.name as requester_name
       FROM substitute_requests sr
       JOIN leave_requests lr ON sr.leave_request_id = lr.id
       JOIN users u ON lr.user_id = u.user_id
       WHERE sr.requested_user_id=?
       ORDER BY sr.id DESC
       LIMIT 20`,
      [user_id]
    );
    result.substitute_requests = substituteRequests;

    // 3. Department leaves (for HOD)
    if (role === 'hod') {
      const [deptLeaves] = await db.execute(
        `SELECT lr.id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
                lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, 
                lr.principal_status, lr.final_status, lr.applied_at, u1.name as requester_name, 
                u2.name as substitute_name
         FROM leave_requests lr
         LEFT JOIN users u1 ON lr.user_id = u1.user_id
         LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
         WHERE u1.department=?
         ORDER BY lr.applied_at DESC`,
        [department]
      );
      result.department_leaves = deptLeaves;
    }

    // 4. Institution leaves (for Principal/Admin)
    if (role === 'admin' || role === 'principal') {
      let query = `
        SELECT lr.id, lr.leave_type, lr.start_date, lr.start_session, lr.end_date, lr.end_session, 
               lr.reason, lr.days, lr.substitute_user_id, lr.substitute_status, lr.hod_status, 
               lr.principal_status, lr.final_status, lr.applied_at, u1.name as requester_name, 
               u1.department, u2.name as substitute_name
        FROM leave_requests lr
        LEFT JOIN users u1 ON lr.user_id = u1.user_id
        LEFT JOIN users u2 ON lr.substitute_user_id = u2.user_id
      `;
      const params = [];
      
      if (selected_department) {
        query += " WHERE u1.department=?";
        params.push(selected_department);
      }
      
      query += " ORDER BY lr.applied_at DESC";
      
      const [instLeaves] = await db.execute(query, params);
      result.institution_leaves = instLeaves;

      // Get departments
      const [depts] = await db.execute("SELECT DISTINCT department FROM users WHERE role='faculty'");
      result.departments = depts.map(d => d.department);
    }

    res.json(result);

  } catch (error) {
    console.error('Leave history error:', error);
    res.status(500).json({ error: "Failed to fetch leave history" });
  }
});

// Get substitute requests
router.get('/substitute-requests', async (req, res) => {
  try {
    const user_id = req.session.user_id;
    
    const [requests] = await db.execute(
      `SELECT sr.id, lr.id as leave_id, lr.user_id, lr.leave_type, lr.start_date, lr.end_date, 
              lr.days, lr.reason, lr.arrangement_details, sr.status, sr.responded_at, u.name as requester_name
       FROM substitute_requests sr
       JOIN leave_requests lr ON sr.leave_request_id = lr.id
       JOIN users u ON lr.user_id = u.user_id
       WHERE sr.requested_user_id=? AND sr.status='Pending'
       ORDER BY sr.id DESC LIMIT 10`,
      [user_id]
    );

    res.json({ requests });
  } catch (error) {
    console.error('Substitute requests error:', error);
    res.status(500).json({ error: "Failed to fetch substitute requests" });
  }
});

// Accept substitute request
router.post('/substitute-requests/:id/accept', async (req, res) => {
  try {
    const request_id = req.params.id;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE substitute_requests SET status='Accepted', responded_at=NOW() WHERE id=?",
        [request_id]
      );

      await connection.execute(
        `UPDATE leave_requests lr 
         JOIN substitute_requests sr ON lr.id = sr.leave_request_id 
         SET lr.substitute_status='Accepted', lr.substitute_responded_at=NOW() 
         WHERE sr.id=?`,
        [request_id]
      );

      await connection.commit();
      res.json({ message: "Substitute request accepted" });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Accept substitute error:', error);
    res.status(500).json({ error: "Failed to accept substitute request" });
  }
});

// Reject substitute request
router.post('/substitute-requests/:id/reject', async (req, res) => {
  try {
    const request_id = req.params.id;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE substitute_requests SET status='Rejected', responded_at=NOW() WHERE id=?",
        [request_id]
      );

      await connection.execute(
        `UPDATE leave_requests lr 
         JOIN substitute_requests sr ON lr.id = sr.leave_request_id 
         SET lr.substitute_status='Rejected', lr.substitute_responded_at=NOW(), lr.final_status='Rejected'
         WHERE sr.id=?`,
        [request_id]
      );

      await connection.commit();
      res.json({ message: "Substitute request rejected" });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Reject substitute error:', error);
    res.status(500).json({ error: "Failed to reject substitute request" });
  }
});

module.exports = router;