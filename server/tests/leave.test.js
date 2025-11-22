// tests/leave.test.js
const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

describe("LEAVE ROUTES", () => {
  // generate unique IDs per run to avoid collisions across test suites
  const suffix = Date.now().toString().slice(-5);
  const user = {
    id: `LEAVE_TEST_${suffix}`,
    password: "leave123",
    email: `leave+${suffix}@test.com`,
    dept: "CSE"
  };
  const substitute = {
    id: `SUB_${suffix}`,
    email: `sub+${suffix}@test.com`
  };

  let cookie;

  beforeAll(async () => {
    // make sure fk checks are off while cleaning/inserting (optional)
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    // remove any previous leftover rows for these ids/emails (safe id + email deletes)
    await pool.query("DELETE FROM leave_requests WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM leave_requests WHERE user_id = ?", [substitute.id]);
    await pool.query("DELETE FROM leave_balance WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM leave_balance WHERE user_id = ?", [substitute.id]);
    await pool.query("DELETE FROM users WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM users WHERE user_id = ?", [substitute.id]);
    await pool.query("DELETE FROM users WHERE email = ?", [user.email]);
    await pool.query("DELETE FROM users WHERE email = ?", [substitute.email]);

    // create main user
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (user_id, name, email, phone, role, department_code, password, is_active)
       VALUES (?, ?, ?, ?, 'faculty', ?, ?, 1)`,
      [user.id, "Leave User", user.email, "9999999999", user.dept, hashed]
    );

    // create substitute user
    await pool.query(
      `INSERT INTO users (user_id, name, email, phone, role, department_code, password, is_active)
       VALUES (?, ?, ?, ?, 'faculty', ?, ?, 1)`,
      [substitute.id, "Sub User", substitute.email, "9999998888", "CSE", hashed]
    );

    // login to get session cookie (session-based auth)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        user_id: user.id,
        password: user.password
      });

    expect(loginRes.statusCode).toBe(200);
    cookie = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    // Clean up test data (do not call pool.end() here)
    await pool.query("DELETE FROM leave_requests WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM leave_balance WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM users WHERE user_id = ?", [user.id]);

    await pool.query("DELETE FROM leave_requests WHERE user_id = ?", [substitute.id]);
    await pool.query("DELETE FROM leave_balance WHERE user_id = ?", [substitute.id]);
    await pool.query("DELETE FROM users WHERE user_id = ?", [substitute.id]);

    // re-enable FK checks if you changed them
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
  });

  test("User should apply leave", async () => {
    const res = await request(app)
      .post("/api/apply")
      .set("Cookie", cookie)
      .send({
        leave_type: "Casual Leave",
        start_date: "2025-01-10",
        start_session: "Forenoon",
        end_date: "2025-01-11",
        end_session: "Afternoon",
        substitute_id: substitute.id,   // MUST include substitute to satisfy FK
        reason: "Testing leave"
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.leave_id).toBeDefined();
  });

  test("User should get leave history", async () => {
    const res = await request(app)
      .get("/api/leave_history")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applied_leaves)).toBe(true);
  });
});
