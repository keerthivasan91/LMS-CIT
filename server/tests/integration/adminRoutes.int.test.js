const request = require("supertest");
const app = require("../../app");
const db = require("../../config/db");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
  await db.query("SET FOREIGN_KEY_CHECKS = 0");

  await db.query("DELETE FROM users WHERE user_id = 'ADM001'");
  await db.query("DELETE FROM users WHERE user_id = 'TEST101'");

  // Seed admin user
  const hashed = await bcrypt.hash("secret123", 10);

  await db.query(`
    INSERT INTO users (user_id, name, email, phone, role, password)
    VALUES ('ADM001', 'Admin', 'admin@lms.com', '9999991234', 'admin', '${hashed}')
  `);
});

afterAll(async () => {
  await db.end();
});

describe("Admin Add User Integration Test", () => {
  let cookie;

  // First login as admin
  it("should login as admin", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ user_id: "ADM001", password: "secret123" });

    cookie = loginRes.headers["set-cookie"];

    expect(cookie).toBeDefined();
  });

  it("POST /api/add-user should create a user", async () => {
    const res = await request(app)
      .post("/api/add-user")        // correct route
      .set("Cookie", cookie)
      .send({
        user_id: "TEST101",
        name: "John Doe",
        email: "john@example.com",
        phone: "9999999999",
        role: "faculty",
        desc: "Lecturer",
        department_code: "CSE",
        date_of_joining: "2024-11-10",
        password: "pass123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User added successfully");
  });
});
