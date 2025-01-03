import request from "supertest";
import mongoose from "mongoose";
import User from "../models/user";
import bcrypt from "bcrypt";
import * as core from "express-serve-static-core";
import initApp from "../server";

describe("AuthController", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await initApp();
  });
  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
  });
  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  describe("POST /register", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/register").send({});
      expect(res.status).toBe(400);
      expect(res.text).toBe("All fields are required");
    });

    it("should return 409 if user already exists", async () => {
      const user = new User({
        email: "test@example.com",
        password: "hashedPassword",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
      });
      await user.save();

      const res = await request(app).post("/register").send({
        email: "test@example.com",
        password: "password",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
      });
      expect(res.status).toBe(409);
      expect(res.text).toBe("User Already Exist. Please Login");
    });

    it("should create a new user and return 201", async () => {
      const res = await request(app).post("/register").send({
        email: "newuser@example.com",
        password: "password",
        firstname: "Jane",
        lastname: "Smith",
        username: "janesmith",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
    });
  });

  describe("POST /login", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 404 if credentials are invalid", async () => {
      const res = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password",
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return tokens if credentials are valid", async () => {
      const password = await bcrypt.hash("password", 10);
      const user = new User({
        email: "validuser@example.com",
        password,
        firstname: "Valid",
        lastname: "User",
        username: "validuser",
      });
      await user.save();

      const res = await request(app).post("/login").send({
        email: "validuser@example.com",
        password: "password",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });
  });

  describe("POST /logout", () => {
    it("should handle logout successfully", async () => {
      const password = await bcrypt.hash("password", 10);
      const user = new User({
        email: "logoutuser@example.com",
        password,
        firstname: "Logout",
        lastname: "User",
        username: "logoutuser",
        refreshTokens: ["testRefreshToken"],
      });
      await user.save();

      const res = await request(app).post("/logout").send({
        refreshToken: "testRefreshToken",
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /refreshToken", () => {
    it("should return new tokens on success", async () => {
      const password = await bcrypt.hash("password", 10);
      const user = new User({
        email: "refreshtokenuser@example.com",
        password,
        firstname: "Refresh",
        lastname: "Token",
        username: "refreshtokenuser",
        refreshTokens: ["validRefreshToken"],
      });
      await user.save();

      const res = await request(app).post("/refreshToken").send({
        refreshToken: "validRefreshToken",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should return 403 if token is invalid", async () => {
      const res = await request(app).post("/refreshToken").send({
        refreshToken: "invalidToken",
      });
      expect(res.status).toBe(403);
    });
  });
});
