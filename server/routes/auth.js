const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { login, me, logout } = require('../controllers/authController');
const sessionAuth = require('../middleware/authMiddleware');

// Rate limiter only for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again later."
});

// Public Login
router.post('/login', loginLimiter, login);

// Protected
router.get('/me', sessionAuth(), me);

// Logout
router.post('/logout', sessionAuth(), logout);

module.exports = router;
