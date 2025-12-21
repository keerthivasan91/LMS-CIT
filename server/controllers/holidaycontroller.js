const pool = require("../config/db");

// GET
async function getHolidays(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT holiday_id, date, name FROM holidays ORDER BY date"
    );
    res.json({ holidays: rows });
  } catch (err) {
    next(err);
  }
}

// ADD
async function addHoliday(req, res, next) {
  try {
    const { date, name, description, academic_year } = req.body;

    await pool.query(
      `INSERT INTO holidays (date, name, description, academic_year)
       VALUES (?, ?, ?, ?)`,
      [date, name, description || null, academic_year || null]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}


// UPDATE
async function updateHoliday(req, res, next) {
  try {
    const { id } = req.params;
    const { date, name, description, academic_year } = req.body;

    await pool.query(
      `UPDATE holidays 
       SET date = ?, name = ?, description = ?, academic_year = ?
       WHERE holiday_id = ?`,
      [date, name, description || null, academic_year || null, id]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}


// DELETE
async function deleteHoliday(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM holidays WHERE holiday_id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHolidays, addHoliday, updateHoliday, deleteHoliday };
