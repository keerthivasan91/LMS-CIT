const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

// Load environment variables
dotenv.config();

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { authMiddleware, optionalAuth } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const hodRoutes = require('./routes/hodRoutes');
const profileRoutes = require('./routes/profileRoutes');
const principalRoutes = require('./routes/principalRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import services
const logger = require('./services/logger');

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeDatabase() {
    // Database connection is handled in config/db.js
    // This method is for any additional DB setup
    logger.info('Database configuration loaded');
  }

  initializeMiddlewares() {
    // CORS middleware
    this.app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files middleware (if serving frontend from Express)
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static(path.join(__dirname, '../client/dist')));
    }

    // Session configuration with MySQL store
    const sessionStore = new MySQLStore({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'faculty_leave',
      clearExpired: true,
      checkExpirationInterval: 900000, // 15 minutes
      expiration: 86400000, // 24 hours
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    });

    // Session middleware
    this.app.use(session({
      key: 'session_cookie',
      secret: process.env.SESSION_SECRET || 'lms-cit-secret-key-2024',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      }
    }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.session?.user_id || 'anonymous'
      });
      next();
    });

    // Security headers middleware
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });

    // Inject user info into all responses (optional)
    this.app.use(optionalAuth);
  }

  initializeRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/leaves', authMiddleware, leaveRoutes);
    this.app.use('/api/profile', authMiddleware, profileRoutes);
    this.app.use('/api/hod', authMiddleware, hodRoutes);
    this.app.use('/api/principal', authMiddleware, principalRoutes);
    this.app.use('/api/admin', authMiddleware, adminRoutes);

    // Health check endpoint (no auth required)
    this.app.get('/api/health', (req, res) => {
      const healthcheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      };
      
      logger.debug('Health check performed', { 
        userId: req.session?.user_id || 'anonymous' 
      });
      
      res.json(healthcheck);
    });

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'LMS-CIT API Server',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          leaves: '/api/leaves',
          profile: '/api/profile',
          hod: '/api/hod',
          principal: '/api/principal',
          admin: '/api/admin'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      });
    }

    // 404 handler for API routes
    this.app.use('/api/*', notFoundHandler);
  }

  initializeErrorHandling() {
    // Global error handler
    this.app.use(errorHandler);

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', { reason, promise });
      // In production, you might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      // In production, you might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`, {
        environment: process.env.NODE_ENV || 'development',
        port: this.port
      });
      
      console.log(`\n🎯 LMS-CIT Backend Server Started!`);
      console.log(`📍 Port: ${this.port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API Base: http://localhost:${this.port}/api`);
      console.log(`❤️  Health: http://localhost:${this.port}/api/health`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log(`=========================================\n`);
    });

    return this.server;
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        logger.info('Server stopped gracefully');
        console.log('Server stopped gracefully');
      });
    }
  }
}

module.exports = App;