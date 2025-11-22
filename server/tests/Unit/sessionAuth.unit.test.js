const sessionAuth = require("../../middleware/authMiddleware");

describe("sessionAuth middleware", () => {
  
  // Case 1: No session → 401
  it("should block request if user is not logged in", () => {
    const req = { session: null };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    sessionAuth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  // Case 2: User logged in but missing required role → 403
  it("should block request with 403 if user role is not allowed", () => {
    const req = {
      session: {
        user: { role: "faculty" }
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    sessionAuth(["admin"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  // Case 3: User logged in and role allowed → next()
  it("should allow request if user has required role", () => {
    const req = {
      session: {
        user: { role: "admin" }
      }
    };

    const res = {};
    const next = jest.fn();

    sessionAuth(["admin"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});
