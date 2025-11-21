const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

describe("HOD ROUTES", () => {
  const hod = {
    id: "HOD_TEST1",
    password: "hod123",
    dept: "CSE",
    email: "hod@test.com"
  };

  const faculty = {
    id: "FAC_TEST1",
    password: "fac123",
    dept: "CSE",
    email: "fac@test.com"
  };

  let hodCookie;
  let leave_id;

  beforeAll(async () => {
    const hashedHod = await bcrypt.hash(hod.password, 10);
    const hashedFac = await bcrypt.hash(faculty.password, 10);

    // Insert HOD
    await pool.query(
      `
      INSERT INTO users 
      (user_id, name, email, phone, role, department_code, password, is_active)
      VALUES (?, "Hod User", ?, "9999999999", "hod", ?, ?, 1)
      `,
      [hod.id, hod.email, hod.dept, hashedHod]
    );

    // Insert faculty
    await pool.query(
      `
      INSERT INTO users 
      (user_id, name, email, phone, role, department_code, password, is_active)
      VALUES (?, "Fac User", ?, "9999999999", "faculty", ?, ?, 1)
      `,
      [faculty.id, faculty.email, faculty.dept, hashedFac]
    );

    // Faculty applies leave
    await pool.query(
      `
      INSERT INTO leave_requests
      (user_id, department_code, leave_type, start_date, end_date, start_session, end_session, reason, hod_status, principal_status)
      VALUES (?, ?, "Casual Leave", "2025-01-10", "2025-01-10", "Forenoon", "Afternoon", "Test leave", "pending", NULL)
      `,
      [faculty.id, faculty.dept]
    );

    const [rows] = await pool.query(
      "SELECT leave_id FROM leave_requests ORDER BY leave_id DESC LIMIT 1"
    );

    leave_id = rows[0].leave_id;

    // HOD login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ user_id: hod.id, password: hod.password });

    hodCookie = loginRes.headers["set-cookie"][0];
  });

  afterAll(async () => {
    await pool.query("DELETE FROM leave_requests WHERE leave_id=?", [leave_id]);
    await pool.query("DELETE FROM users WHERE user_id IN (?, ?)", [
      hod.id,
      faculty.id
    ]);
    await pool.end();
  });

  test("HOD dashboard should load pending requests", async () => {
    const res = await request(app)
      .get("/api/hod/requests")
      .set("Cookie", hodCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  test("HOD should approve leave", async () => {
    const res = await request(app)
      .post(`/api/hod/approve/${leave_id}`)
      .set("Cookie", hodCookie);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
