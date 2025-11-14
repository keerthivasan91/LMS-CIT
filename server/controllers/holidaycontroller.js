const pool = require('../config/db');

async function getHolidays(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          date,
          name,
          description,
          academic_year
       FROM holidays
       ORDER BY date`
    );

    res.json({ holidays: rows });

  } catch (err) {
    next(err);
  }
}

module.exports = { getHolidays };
