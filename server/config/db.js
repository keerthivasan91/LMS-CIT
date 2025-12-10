const mysql = require('mysql2/promise');
const logger = require('../services/logger');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'lms_cit',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
pool.on('acquire', (connection) => {
  logger.debug(`Connection ${connection.threadId} acquired`);
});

pool.on('release', (connection) => {
  logger.debug(`Connection ${connection.threadId} released`);
});

// Monitor pool health
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const status = pool.pool;
    logger.info(`Pool status - Total: ${status._allConnections.length}, Free: ${status._freeConnections.length}`);
  }, 600000); // every 10 minutes
}


module.exports = pool;
