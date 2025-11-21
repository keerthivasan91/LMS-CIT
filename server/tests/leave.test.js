const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

describe("LEAVE ROUTES", () => {
  const user = {
    id: "LEAVE_TEST1",
    password: "leave123",
    email: "leave@test.com",
    dept: "CSE"
  };

  let cookie;

  beforeAll(async () => {
    const hashed = await bcrypt.hash(user.password, 10);

    await pool.query(`
      INSERT INTO users 
      (user_id, name, email, phone, role, department_code, password, is_active)
      VALUES (?, "Leave User", ?, "9999999999", "faculty", ?, ?, 1)
    `, [user.id, user.email, user.dept, hashed]);

    // Login to get session
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        user_id: user.id,
        password: user.password
      });

    cookie = loginRes.headers["set-cookie"][0];
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM leave_requests WHERE user_id=?`, [user.id]);
    await pool.query(`DELETE FROM users WHERE user_id=?`, [user.id]);
    await pool.end();
  });

  test("User should apply leave", async () => {
    const res = await request(app)
      .post("/api/apply")
      .set("Cookie", cookie)
      .send({
        leave_type: "Casual Leave",
        start_date: "2025-01-10",
        start_session: "Foorenoon",
        end_date: "2025-01-11",
        end_session: "Afternoon",
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
