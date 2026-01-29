// services/leaveDeduction.service.js

exports.deduct = async ({
  conn,
  user_id,
  leave_type,
  days,
  academic_year
}) => {
  const map = {
    "Casual Leave": "casual",
    "Restricted Holiday": "rh",
    "Earned Leave": "earned"
  };

  const field = map[leave_type];
  if (!field) return; // non-deductible leave types

  await conn.query(
    `UPDATE leave_balance
     SET ${field}_used = ${field}_used + ?
     WHERE user_id = ? AND academic_year = ?`,
    [days, user_id, academic_year]
  );
};
