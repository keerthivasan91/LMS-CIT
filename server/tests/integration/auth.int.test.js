const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const request = require("supertest");

let app;
let cookie;

beforeAll(async () => {
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Disable trigger (test safe)
    await db.query("DROP TRIGGER IF EXISTS trg_add_leave_balance");

    // Clean previous test users (IMPORTANT)
    await db.query("DELETE FROM leave_balance WHERE user_id='A001'");
    await db.query("DELETE FROM users WHERE user_id='A001'");

    await db.query("DELETE FROM leave_balance WHERE user_id='TEST102'");
    await db.query("DELETE FROM users WHERE user_id='TEST102'");


    // Insert test admin
    const hashed = await bcrypt.hash("admin123", 10);
    await db.query(`
        INSERT INTO users (user_id, name, email, phone, role, password)
        VALUES ('A001', 'Admin', 'admin@example.com', '9999999999', 'admin', '${hashed}')
    `);

    app = require("../../app");
});

afterAll(async () => {
    await db.end();
});

describe("Authentication Integration Test", () => {
    it("should login and set session cookie", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ user_id: "A001", password: "admin123" });

        expect(res.statusCode).toBe(200);
        expect(res.headers["set-cookie"]).toBeDefined();

        cookie = res.headers["set-cookie"];
    });

    it("POST /api/add-user should create a user", async () => {
        const res = await request(app)
            .post("/api/add-user")
            .set("Cookie", cookie)
            .send({
                user_id: "TEST102",
                name: "John Doe",
                email: "john111@example.com",     // reused email → now cleaned
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
