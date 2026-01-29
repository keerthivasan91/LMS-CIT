const pool = require("../../config/db");

/* ============================================================
   CREDIT LEAVES BASED ON JOINING DATE (NO TRIGGERS)
   SAFE • IDEMPOTENT • YEAR-AWARE
============================================================ */

exports.creditYearlyLeaves = async ({
  user_id,
  role,
  date_joined,
  academic_year
}) => {
  const joined = new Date(date_joined);
  const joinYear = joined.getFullYear();
  const joinMonth = joined.getMonth() + 1;

  const year = academic_year || new Date().getFullYear();

  /* =========================
     CASUAL LEAVE (CL)
  ========================= */
  let casual_total;

  if (year === joinYear) {
    // Join year → prorated
    casual_total = Math.max(12 - joinMonth + 1, 0);
  } else {
    // Every new year → full CL
    casual_total = 12;
  }

  /* =========================
     RESTRICTED HOLIDAY (RH)
  ========================= */
  let rh_total;

  if (year === joinYear) {
    rh_total = joinMonth <= 6 ? 2 : 1;
  } else {
    rh_total = 2;
  }

  /* =========================
     EARNED LEAVE (EL)
  ========================= */
  let earned_total = 0;

  const oneYearAfterJoining = new Date(joined);
  oneYearAfterJoining.setFullYear(joined.getFullYear() + 1);

  const today = new Date();
  if (today >= oneYearAfterJoining) {
    earned_total =
      role === "faculty" || role === "hod" ? 6 :
      role === "staff" ? 4 :
      role === "principal" ? 8 :
      0;
  }

  /* =========================
     UPSERT (IDEMPOTENT)
  ========================= */
  await pool.query(
    `INSERT INTO leave_balance
     (user_id, academic_year,
      casual_total, casual_used,
      rh_total, rh_used,
      earned_total, earned_used)
     VALUES (?, ?, ?, 0, ?, 0, ?, 0)
     ON DUPLICATE KEY UPDATE
       casual_total = VALUES(casual_total),
       rh_total = VALUES(rh_total),
       earned_total = VALUES(earned_total)`,
    [
      user_id,
      year,
      casual_total,
      rh_total,
      earned_total
    ]
  );
};
