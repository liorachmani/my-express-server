import request from "supertest";
import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import * as core from "express-serve-static-core";
import initApp from "../server";

const testUser: IUser & Partial<{ accessToken: string; _id: string }> = {
  email: "test@gmail.com",
  password: "password",
  firstName: "John",
  lastName: "Doe",
  userName: "johndoe",
  image: "default.jpg",
};

describe("AuthController", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await initApp();
    await User.deleteMany({});
  });
  afterAll(async () => {
    // Disconnect from the test database
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  describe("POST /register", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.text).toBe("All fields are required");
    });

    it("should return 409 if user already exists", async () => {
      const user = new User({
        ...testUser,
        password: await bcrypt.hash(testUser.password, 10),
      });
      await user.save();

      const res = await request(app).post("/auth/register").send(testUser);
      expect(res.status).toBe(409);
      expect(res.text).toBe("User Already Exist. Please Login");
      await User.deleteMany({});
    });

    it("should create a new user and return 201", async () => {
      const newUser = {
        ...testUser,
        email: "newuser@example.com",
        userName: "newuser",
      };
      const res = await request(app).post("/auth/register").send(newUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
    });

    it("should handle errors when registering a user", async () => {
      jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post("/auth/register").send(testUser);
      expect(res.status).toBe(500);
      expect(res.text).toBe("Internal Server Error");
    });
  });

  describe("POST /login", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 404 if credentials are invalid", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password",
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return tokens if credentials are valid", async () => {
      const password = await bcrypt.hash(testUser.password, 10);
      const user = new User({
        ...testUser,
        password,
      });
      await user.save();

      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      testUser.accessToken = res.body.accessToken;
      testUser.refreshTokens = [res.body.refreshToken];
    });

    it("should handle errors when logging in", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(500);
      expect(res.text).toBe("Internal Server Error");
    });
  });

  describe("POST /refresh-token", () => {
    it("should return new tokens on success", async () => {
      const res = await request(app).post("/auth/refresh-token").send({
        refreshToken: testUser?.refreshTokens?.[0],
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      testUser.accessToken = res.body.accessToken;
      testUser.refreshTokens = [res.body.refreshToken];
    });

    it("should return 403 if token is invalid", async () => {
      const res = await request(app).post("/auth/refresh-token").send({
        refreshToken: "invalidToken",
      });
      expect(res.status).toBe(403);
    });

    it("should handle errors when refreshing token", async () => {
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post("/auth/refresh-token").send({
        refreshToken: testUser?.refreshTokens?.[0],
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /logout", () => {
    it("should handle logout successfully", async () => {
      const res = await request(app).post("/auth/logout").send({
        refreshToken: testUser?.refreshTokens?.[0],
      });
      expect(res.status).toBe(200);
    });

    it("should handle errors when logging out", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post("/auth/logout").send({
        refreshToken: testUser?.refreshTokens?.[0],
      });
      expect(res.status).toBe(500);
      expect(res.text).toBe("Internal Server Error");
    });
  });
});
