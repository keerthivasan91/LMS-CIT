// services/logger.js

const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

// Log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`
  )
);

// Daily rotate file settings
const dailyRotateFile = new transports.DailyRotateFile({
  filename: path.join("logs", "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d", // keep last 30 days
});

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console(), // log in terminal
    dailyRotateFile            // log in logs/ folder
  ],
});

// Convenience wrappers
logger.info = (msg) => logger.log({ level: "info", message: msg });
logger.error = (msg) => logger.log({ level: "error", message: msg });
logger.warn = (msg) => logger.log({ level: "warn", message: msg });

module.exports = logger;
