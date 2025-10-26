const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { authMiddleware, optionalAuth, sessionValidator } = require('./middleware/authMiddleware');
const logger = require('./services/logger');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for API (configure properly for production)
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests',
    message: 'Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware with limits
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 100
}));

// Request logging
if (isProduction) {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Session store configuration
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'faculty_leave',
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
  expiration: 24 * 60 * 60 * 1000, // 24 hours
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

// Session middleware with enhanced security
app.use(session({
  name: 'lms.sid',
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'lms-cit-secure-session-secret-2024-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Refresh session on every request
  cookie: {
    secure: isProduction, // Use HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'strict' : 'lax',
    domain: isProduction ? process.env.DOMAIN : undefined
  }
}));

// Session validation middleware
app.use(sessionValidator);

// Security headers middleware
app.use((req, res, next) => {
  // Remove potentially sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.session?.user_id || 'anonymous'
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.session?.user_id || 'anonymous'
    });
  });

  next();
});

// Optional authentication (adds user info to req if available)
app.use(optionalAuth);

// Import centralized routes
const apiRoutes = require('./routes/index');

// Use API routes with base path
app.use('/api', apiRoutes);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    database: 'connected' // You can add actual DB health check here
  };

  res.json(healthcheck);
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'LMS-CIT API Server',
    version: '1.0.0',
    documentation: 'https://github.com/your-org/lms-cit/docs',
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

// Serve static files in production (if serving frontend from Express)
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Catch-all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// 404 handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
  
  // In production, you might want to exit the process
  if (isProduction) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // In production, exit the process
  if (isProduction) {
    process.exit(1);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }
    
    logger.info('Server closed gracefully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  console.log(`\n🎯 LMS-CIT Backend Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`🔒 Secure: ${isProduction ? 'Yes (HTTPS)' : 'No (Development)'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`=========================================\n`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

module.exports = server;