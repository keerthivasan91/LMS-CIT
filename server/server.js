require("dotenv").config();
const logger = require("./services/logger");
const app = require("./app");  
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

// ✅ Only ONE app.listen() call
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close the server first (stop accepting new connections)
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database pool
    try {
      await pool.end();
      console.log('Database pool closed');
    } catch (err) {
      console.error('Error closing database pool:', err);
    }
    
    // Exit process
    process.exit(0);
  });

  // Force shutdown after timeout (10 seconds)
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});