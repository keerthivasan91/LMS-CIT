const pool = require("../../config/db");
const leavePolicy = require("../../policies/leave.policy");

/* ============================================================
   GET USER BALANCE (SAFE)
============================================================ */
exports.getBalance = async (userId, academicYear) => {
  const [[row]] = await pool.query(
    `SELECT *
     FROM leave_balance
     WHERE user_id = ? AND academic_year = ?`,
    [userId, academicYear]
  );

  return row || null;
};

/* ============================================================
   ENSURE BALANCE ROW EXISTS (YEAR INIT)
============================================================ */
exports.ensureBalanceRow = async ({ conn, user_id, role, academic_year }) => {
  const policy = leavePolicy.getPolicy(role);

  await conn.query(
    `INSERT INTO leave_balance
     (user_id, academic_year,
      casual_total, casual_used,
      earned_total, earned_used,
      rh_total, rh_used)
     VALUES (?, ?, ?, 0, ?, 0, ?, 0)
     ON DUPLICATE KEY UPDATE user_id = user_id`,
    [
      user_id,
      academic_year,
      policy.casual,
      policy.earned,
      policy.rh
    ]
  );
};



/* ============================================================
   DEDUCT LEAVE (AFTER FINAL APPROVAL) — ATOMIC
============================================================ */
exports.deduct = async ({
  conn,
  user_id,
  leave_type,
  days,
  academic_year
}) => {
  if (!days || days <= 0) return;

  const map = {
    "Casual Leave": "casual",
    "Restricted Holiday": "rh",
    "Earned Leave": "earned"
  };

  const field = map[leave_type];
  if (!field) return;

  const [result] = await conn.query(
    `UPDATE leave_balance
     SET ${field}_used = ${field}_used + ?
     WHERE user_id = ?
       AND academic_year = ?
       AND (${field}_total - ${field}_used) >= ?`,
    [days, user_id, academic_year, days]
  );

  if (result.affectedRows === 0) {
    throw new Error("Leave balance insufficient during deduction");
  }
};
