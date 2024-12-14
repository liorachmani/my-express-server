import { Express } from "express-serve-static-core";
import request from "supertest";
import mongoose from "mongoose";
import promiseApp from "../server";

const userParams = {
  email: "test@example.com",
  password: "password123",
  firstname: "John",
  lastname: "Doe",
  username: "johndoe",
};

describe("Auth", () => {
  let app: Express;
  beforeAll(async () => {
    app = await promiseApp;
    // Connect to the test database
    await mongoose.connect("mongodb://localhost:27017/testdb");
  });
  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });
  describe("Register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send(userParams);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("email", userParams.email);
    });

    it("should not register a user with existing email", async () => {
      await request(app).post("/auth/register").send(userParams);
      const res = await request(app).post("/auth/register").send(userParams);
      expect(res.status).toBe(409);
      expect(res.text).toBe("User Already Exist. Please Login");
    });

    it("should return 400 if any field is missing", async () => {
      const incompleteParams = { ...userParams, email: undefined };
      const res = await request(app)
        .post("/auth/register")
        .send(incompleteParams);
      expect(res.status).toBe(400);
      expect(res.text).toBe("All fields are required");
    });
  });

  describe("Login", () => {
    it("should login an existing user", async () => {
      await request(app).post("/auth/register").send(userParams);
      const res = await request(app).post("/auth/login").send({
        email: userParams.email,
        password: userParams.password,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 if any field is missing", async () => {
      const res = await request(app).post("/auth/login").send({
        email: userParams.email,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 404 for invalid credentials", async () => {
      const res = await request(app).post("/auth/login").send({
        email: userParams.email,
        password: "wrongpassword",
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("Logout", () => {
    it("should logout a user", async () => {
      const res = await request(app).post("/auth/logout");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Logged out successfully");
    });
  });
});
