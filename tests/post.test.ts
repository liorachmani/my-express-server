import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import Post from "../models/post";
import promiseApp from "../server";

describe("PostController", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await promiseApp;
    // Connect to the test database
    await mongoose.connect("mongodb://localhost:27017/testdb");
  });
  afterEach(async () => {
    // Clean up the database after each test
    await Post.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/post")
      .send({ title: "Test Post", content: "This is a test post" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Post .* created successfully/);
  });

  it("should get all posts", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
    });
    await post.save();

    const res = await request(app).get("/post");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Test Post");
  });

  it("should get a post by ID", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
    });
    await post.save();

    const res = await request(app).get(`/post/${post._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test Post");
  });

  it("should update a post", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
    });
    await post.save();

    const res = await request(app)
      .put(`/post/${post._id}`)
      .send({ title: "Updated Post", content: "This is an updated test post" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Post");
  });

  it("should handle errors when creating a post", async () => {
    jest.spyOn(Post.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .post("/post")
      .send({ title: "Test Post", content: "This is a test post" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database error");
  });

  it("should handle errors when getting posts", async () => {
    jest.spyOn(Post, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/post");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database error");
  });

  it("should handle errors when getting a post by ID", async () => {
    jest.spyOn(Post, "findById").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/post/invalid-id");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database error");
  });

  it("should handle errors when updating a post", async () => {
    jest.spyOn(Post, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .put("/post/invalid-id")
      .send({ title: "Updated Post", content: "This is an updated test post" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database error");
  });
});
