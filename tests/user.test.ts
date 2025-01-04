import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import User from "../models/user";
import initApp from "../server";

describe("UserController", () => {
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

  it("should create a new user", async () => {
    const res = await request(app).post("/user").send({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/User .* created successfully/);
  });

  it("should handle error on user invalid email on register", async () => {
    const res = await request(app).post("/user").send({
      email: "ido.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    expect(res.status).toBe(422);
  });

  it("should get user info by id", async () => {
    const user = new User({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    await user.save();

    const res = await request(app).get(`/user/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("ido");
  });

  it("should update a user", async () => {
    const user = new User({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    await user.save();

    const res = await request(app).put(`/user/${user._id}`).send({
      firstName: "ido0000000",
      lastName: "w",
    });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("ido0000000");
  });

  it("should delete a user", async () => {
    const user = new User({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    await user.save();

    const res = await request(app).delete(`/user/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("ido");
  });

  it("should handle errors when deleting a non exisitng user", async () => {
    const user = new User({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    await user.save();

    const res = await request(app).delete(`/comment/67474a3d2651e79673ab702f`);

    expect(res.status).toBe(404);
  });

  it("should handle errors when a user register", async () => {
    jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).post("/user").send({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    expect(res.status).toBe(500);
  });

  // it("should handle errors when getting a user b", async () => {
  //   jest.spyOn(Comment, "find").mockImplementationOnce(() => {
  //     throw new Error("Database error");
  //   });

  //   const res = await request(app).get("/comment");

  //   expect(res.status).toBe(500);
  // });

  it("should handle errors when getting a user by ID", async () => {
    const res = await request(app).get("/user/invalid-id");

    expect(res.status).toBe(500);
  });

  it("should handle errors when updating invalid user", async () => {
    const res = await request(app).put("/user/invalid-id").send({
      firstName: "ido0000000",
      lastName: "w",
    });

    expect(res.status).toBe(500);
  });

  it("should handle errors when deleting a user", async () => {
    jest.spyOn(User, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const user = new User({
      email: "ido3@gmai.com",
      password: "123",
      firstName: "ido",
      lastName: "w",
    });

    await user.save();

    const res = await request(app).delete(`/user/${user._id}`);

    expect(res.status).toBe(500);
  });

  it("should handle errors when deleting a non exisitng user", async () => {
    const res = await request(app).delete(`/user/67474a3d2651e79673ab702f`);

    expect(res.status).toBe(404);
  });
});
