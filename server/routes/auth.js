const express = require('express');
const router = express.Router();
const loginLimiter  = require('../middleware/rateLimit');

const { login, me, logout } = require('../controllers/authController');
const sessionAuth = require('../middleware/authMiddleware');


// Public Login
router.post('/login', loginLimiter, login);

// Protected
router.get('/me', sessionAuth(), me);

// Logout
router.post('/logout', sessionAuth(), logout);

module.exports = router;
