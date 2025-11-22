const { adminAddUser } = require("../../controllers/adminAddUser");
const UserModel = require("../../models/User");
const sendMail = require("../../config/mailer");
const bcrypt = require("bcryptjs");

jest.mock("../../models/User");
jest.mock("../../config/mailer");
jest.mock("bcryptjs");

describe("adminAddUser - Unit Test", () => {

  it("should add user successfully", async () => {

    // Controller requires req.user
    const req = {
      user: { role: "admin" },
      body: {
        user_id: "T001",
        name: "Test User",
        email: "test@example.com",
        phone: "9999999999",
        role: "faculty",
        desc: "Lecturer",
        department_code: "CSE",
        date_of_joining: "2025-01-01",
        password: "pass123"
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock bcrypt
    bcrypt.hash.mockResolvedValue("hashed_pass");

    // Mock DB check
    UserModel.userExists.mockResolvedValue(false);

    // Mock DB insert
    UserModel.createUser.mockResolvedValue(true);

    // Mock email
    sendMail.mockResolvedValue(true);

    await adminAddUser(req, res);

    expect(UserModel.userExists).toHaveBeenCalled();
    expect(UserModel.createUser).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "User added successfully"
    });
  });

});
