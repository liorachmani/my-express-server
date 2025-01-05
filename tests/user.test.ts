import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import User, { IUser } from "../models/user";
import initApp from "../server";

const testUser: Partial<IUser & { token: string; _id: string }> = {
  email: "test@gmail.com",
  password: "password",
  firstName: "John",
  lastName: "Doe",
  userName: "johndoe",
};

describe("UserController", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await initApp();
  });
  beforeEach(async () => {
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    testUser.token = loginRes.body.accessToken;
    testUser._id = loginRes.body._id;
    expect(testUser.token).toBeDefined();
  });
  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
  });
  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it("should get user info by id", async () => {
    const res = await request(app).get(`/user/${testUser._id}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("John");
  });

  it("should update a user", async () => {
    const res = await request(app)
      .put(`/user`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        firstName: "ido0000000",
        lastName: "w",
      });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("ido0000000");
  });

  it("should delete a user", async () => {
    const res = await request(app)
      .delete(`/user`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("John");
  });

  it("should handle errors when getting a user by ID", async () => {
    const res = await request(app).get("/user/invalid-id");

    expect(res.status).toBe(500);
  });

  it("should handle errors when updating a user", async () => {
    jest.spyOn(User, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .put(`/user`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        firstName: "ido0000000",
        lastName: "w",
      });

    expect(res.status).toBe(500);
  });
  
  it("should handle errors when deleting a user", async () => {
    jest.spyOn(User, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .delete(`/user`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    console.log(res.body);

    expect(res.status).toBe(500);
  });
});
