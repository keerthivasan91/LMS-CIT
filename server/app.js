require("dotenv").config();
const pool = require('./config/db');
const session = require("express-session");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const rateLimit = require("./middleware/rateLimit");
const { errorHandler } = require("./middleware/errorHandler");
const processMailQueue = require("./workers/mailWorker");

const authRoutes = require("./routes/auth");
const branchRoutes = require("./routes/branches");
const leaveRoutes = require("./routes/leave");
const substituteRoutes = require("./routes/substitute");
const hodRoutes = require("./routes/hod");
const adminRoutes = require("./routes/admin");
const profileRoutes = require("./routes/profile");
const holidayRoutes = require("./routes/holiday");
const changePasswordRoutes = require("./routes/changepassword");
const forgotPasswordRoutes = require("./routes/forgotpassword");
const apiLimiter = require("./middleware/rateLimit");


const app = express();
app.set("trust proxy", 1);
app.use(compression());
app.disable("x-powered-by");
app.use(helmet());
app.use(helmet.frameguard({ action: "deny" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://lms-cit.duckdns.org',
      'https://d31bsugjsi7j8z.cloudfront.net',
      'https://lms-cit-production-cb35.up.railway.app',
      'https://lms-cit-production.up.railway.app'
    ]
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

app.options('*', cors()); // enable pre-flight for all routes

app.use(
  session({
    name : "session_id",
    store: sessionStore,
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax' , // same site means strict else none
      //domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined ,
      maxAge: (1000 * 60 * 30), // 30 minutes
    }
  })
);

app.use(morgan("combined"));

app.use(rateLimit);


// API routes
app.use("/api", changePasswordRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api",apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api", branchRoutes);
app.use("/api", leaveRoutes);
app.use("/api/substitute", substituteRoutes);  // <-- FIXED
app.use("/api", hodRoutes);
app.use("/api", adminRoutes);
app.use("/api", profileRoutes);
app.use("/api/holidays", holidayRoutes);        // <-- better consistency
app.use("/api/notifications", require("./routes/notifications")); // <-- FIXED

setInterval(async () => {
  try {
    await processMailQueue();
  } catch (err) {
    logger.error('Mail queue worker error:', err);
  }
}, 60000); // every 10 minutes





// Health check
app.get("/health", async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(), // Time the process has been running
    message: "OK",            // Status message
    timestamp: new Date().toISOString(), // ISO 8601 format for clarity
    database: "checking...",
    // Add other critical services here (e.g., mail, cache)
    services: {} 
  };

  const TIMEOUT_MS = 3000; // Reduced timeout for faster failure detection (was 5000)

  try {
    // 1. Database Connection Test
    const dbTest = pool.query("SELECT 1 + 1 AS result");
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("DB timeout")), TIMEOUT_MS);
    });

    await Promise.race([dbTest, timeout]);
    healthcheck.database = "connected";

    // 2. Add other service checks here (e.g., Redis, external APIs)
    // healthcheck.services.redis = await checkRedisConnection(); 
    
    // 3. Security enhancement: Limit response data to essential fields
    res.status(200).json({ 
        status: 200, 
        message: healthcheck.message, 
        database: healthcheck.database,
        services: healthcheck.services 
    });

  } catch (error) {
    // Log the detailed error, but don't expose it all publicly
    console.error("Health Check Failure:", error.message); 
    
    // Update the health check status
    healthcheck.message = "Service Unavailable";
    
    // If the error was a DB timeout, set the DB status explicitly
    if (error.message.includes("DB timeout")) {
      healthcheck.database = `error: ${error.message}`;
    } else {
      // General error catch
      healthcheck.database = `error: connection failed`;
    }

    // Return status 503 (Service Unavailable)
    res.status(503).json({
      status: 503,
      message: healthcheck.message,
      database: healthcheck.database,
      timestamp: healthcheck.timestamp,
      // NOTE: We generally hide `uptime` for security when 503
    });
  }
});

app.use(errorHandler);

module.exports = app;   // <-- FIXED EXPORT
