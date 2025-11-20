const express = require('express');
const router = express.Router();

const { login, me, logout } = require('../controllers/authController');
const sessionAuth = require('../middleware/sessionAuth');

// Public
router.post('/login', login);

// Protected
router.get('/me', sessionAuth, me);

// Logout
router.post('/logout', sessionAuth, logout);

module.exports = router;
