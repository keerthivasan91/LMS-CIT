const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

describe("AUTH ROUTES", () => {
  const testUser = {
    user_id: "TEST_USER1",
    password: "pass123",
    role: "faculty",
    department_code: "CSE",
    email: "testuser@test.com",
  };

  beforeAll(async () => {
    const hashed = await bcrypt.hash(testUser.password, 10);

    await pool.query(`
      INSERT INTO users 
      (user_id, name, email, phone, role, department_code, password, is_active)
      VALUES (?, "Test User", ?, "9999999999", ?, ?, ?, 1)
    `, [testUser.user_id, testUser.email, testUser.role, testUser.department_code, hashed]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE user_id = ?`, [testUser.user_id]);
    await pool.end();
  });

  test("Login should return session cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        user_id: testUser.user_id,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("GET /api/auth/me should return logged-in user", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        user_id: testUser.user_id,
        password: testUser.password
      });

    const cookie = loginRes.headers["set-cookie"][0];

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.user_id).toBe(testUser.user_id);
  });
});
