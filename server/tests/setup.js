process.env.NODE_ENV = "test";

// Disable email during tests
jest.mock("../config/mailer", () => jest.fn());

// Disable Twilio during tests
jest.mock("../config/sms", () => ({
  sendSMS: jest.fn(),
}));
