const pool = require("../../config/db");

/* ============================================================
   CREDIT LEAVES BASED ON JOINING DATE (NO TRIGGERS)
   SAFE • IDEMPOTENT • YEAR-AWARE
============================================================ */
/* ============================================================
   CREDIT LEAVES BASED ON JOINING DATE
   SAFE • IDEMPOTENT • TRANSACTION-AWARE
============================================================ */

exports.creditYearlyLeaves = async (conn, {
  user_id,
  designation,
  date_joined,
  academic_year
}) => {

  if (!user_id) {
    throw new Error("creditYearlyLeaves: user_id is missing");
  }

  const joined = new Date(date_joined);
  const joinYear = joined.getFullYear();
  const joinMonth = joined.getMonth() + 1;

  const year = academic_year || new Date().getFullYear();

  /* =========================
     CASUAL LEAVE (CL)
  ========================= */
  let casual_total;

  if (year === joinYear) {
    casual_total = Math.max(15 - joinMonth + 1, 0);
  } else {
    casual_total = 15;
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

  function getAnnualEL(designation) {
    const d = (designation || "").toLowerCase();

    if (
      d.includes("dean") ||
      d.includes("hod") ||
      d.includes("registrar") ||
      d.includes("principal")
    ) {
      return 20;
    }
    return 8;
  }

  const academicYearDate = new Date(year, 0, 1);
  const oneYearAfterJoining = new Date(joined);
  oneYearAfterJoining.setFullYear(joined.getFullYear() + 1);

  if (academicYearDate >= oneYearAfterJoining) {
    earned_total = getAnnualEL(designation);
  }

  /* =========================
     UPSERT (IDEMPOTENT)
  ========================= */
  await conn.query(
  `INSERT INTO leave_balance
   (user_id, academic_year,
    casual_total, casual_used,
    rh_total, rh_used,
    earned_total, earned_used)
   VALUES (?, ?, ?, 0, ?, 0, ?, 0)
   ON DUPLICATE KEY UPDATE
     casual_total = VALUES(casual_total),
     rh_total = VALUES(rh_total),
     earned_total = leave_balance.earned_total + VALUES(earned_total),
     earned_used = 0`,
  [
    user_id,
    year,
    casual_total,
    rh_total,
    earned_total
  ]
);

};
