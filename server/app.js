require("dotenv").config();
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
  ? ['https://lms-cit-production-cb35.up.railway.app','https://lms-cit-production.up.railway.app']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use("/", changePasswordRoutes);
app.use("/", forgotPasswordRoutes);
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
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;   // <-- FIXED EXPORT
