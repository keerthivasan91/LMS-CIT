require("dotenv").config();
const session = require("express-session");
const express = require("express");
const helmet = require("helmet");
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


const app = express();
app.use(helmet());
app.use(helmet.frameguard({ action: "deny" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    key : "session_id",
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite : "lax",
      maxAge: (1000 * 60 * 30), // 30 minutes
    }
  })
);

app.use(morgan("combined"));

app.use(rateLimit);

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials : true
}));

// API routes
app.use("/", changePasswordRoutes);
app.use("/", forgotPasswordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", branchRoutes);
app.use("/api", leaveRoutes);
app.use("/api/substitute", substituteRoutes);  // <-- FIXED
app.use("/api", hodRoutes);
app.use("/api", adminRoutes);
app.use("/api", profileRoutes);
app.use("/api/holidays", holidayRoutes);        // <-- better consistency
app.use("/api/notifications", require("./routes/notifications")); // <-- FIXED

setInterval(() => {
  processMailQueue();
}, 60000); // every 10 minutes





// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;   // <-- FIXED EXPORT
