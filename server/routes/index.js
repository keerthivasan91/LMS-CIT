const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./authRoutes');
const leaveRoutes = require('./leaveRoutes');
const hodRoutes = require('./hodRoutes');
const profileRoutes = require('./profileRoutes');
const principalRoutes = require('./principalRoutes');

// Use the routes with their base paths
router.use('/auth', authRoutes);
router.use('/leaves', leaveRoutes);
router.use('/hod', hodRoutes);
router.use('/profile', profileRoutes);
router.use('/principal', principalRoutes);

// Root API route
router.get('/', (req, res) => {
  res.json({
    message: 'LMS-CIT API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      leaves: '/api/leaves',
      hod: '/api/hod',
      profile: '/api/profile',
      principal: '/api/principal'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LMS-CIT API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;