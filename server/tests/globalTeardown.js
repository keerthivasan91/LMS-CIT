const pool = require("../config/db");

module.exports = async () => {
  try {
    await pool.end();  // close MySQL pool safely
  } catch (e) {}
};
