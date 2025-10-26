const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Login
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ error: "Please enter both User ID and Password" });
    }

    const [users] = await db.execute(
      "SELECT id, user_id, password, role, name, department, email, phone FROM users WHERE user_id=? AND password=?",
      [user_id, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    req.session.user_id = user.user_id;
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.department = user.department;
    req.session.email = user.email;
    req.session.phone = user.phone;

    res.json({ 
      message: "Login successful", 
      user: {
        user_id: user.user_id,
        role: user.role,
        name: user.name,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

// Get branches
router.get('/branches', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT DISTINCT department FROM users WHERE role='faculty' ORDER BY department"
    );
    const branches = rows.map(row => row.department);
    res.json({ branches });
  } catch (error) {
    console.error('Branches error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get staff by branch
router.get('/staff/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const [rows] = await db.execute(
      "SELECT user_id, name FROM users WHERE department=? AND role='faculty' ORDER BY name",
      [branch]
    );
    const staff = rows.map(row => ({ id: row.user_id, name: row.name }));
    res.json({ staff });
  } catch (error) {
    console.error('Staff error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;