import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import Post from "../models/post";
import promiseApp from "../server";
import initApp from "../server";
import User, { IUser } from "../models/user";

const testUser: Partial<IUser & { token: string; _id: string }> = {
  email: "test@gmail.com",
  password: "password",
  firstName: "John",
  lastName: "Doe",
  userName: "johndoe",
};
describe("PostController", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await initApp();
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
    await Post.deleteMany({});
  });
  afterAll(async () => {
    // Disconnect from the test database
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/post")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        title: "Test Post",
        content: "This is a test post",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Post .* created successfully/);
  });

  it("should get all posts without senderId", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
    });
    await post.save();

    const res = await request(app).get("/post");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Test Post");
  });

  it("should get posts by senderId", async () => {
    const post1 = new Post({
      title: "Post 1",
      content: "Content 1",
      user_id: testUser._id,
    });
    const post2 = new Post({
      title: "Post 2",
      content: "Content 2",
      user_id: '677aadc5c9d8d72ddbdec851',
    });
    await post1.save();
    await post2.save();

    const res = await request(app).get("/post").query({ sender: testUser._id });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Post 1");
  });

  it("should get a post by ID", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
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
      user_id: testUser._id,
    });
    await post.save();

    const res = await request(app)
      .put(`/post/${post._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        title: "Updated Post",
        content: "This is an updated test post",
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Post");
  });

  it("should delete a post", async () => {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
    });
    await post.save();

    const res = await request(app)
      .delete(`/post/${post._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Post .* deleted successfully/);
  });

  it("should handle errors when creating a post", async () => {
    jest.spyOn(Post.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .post("/post")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        title: "Test Post",
        content: "This is a test post",
      });

    expect(res.status).toBe(500);
  });

  it("should handle errors when updating a post", async () => {
    jest.spyOn(Post, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
    });
    await post.save();

    const res = await request(app)
      .put(`/post/${post._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        title: "Test Post",
        content: "This is a test post",
      });

    expect(res.status).toBe(500);
  });

  it("should handle errors when deleting a post", async () => {
    jest.spyOn(Post, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
    });
    await post.save();

    const res = await request(app)
      .delete(`/post/${post._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(500);
  });

  it("should handle errors when getting posts", async () => {
    jest.spyOn(Post, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/post");

    expect(res.status).toBe(500);
  });

  it("should handle errors when getting a post by ID", async () => {
    const res = await request(app).get("/post/invalid-id");

    expect(res.status).toBe(500);
  });

  it("should handle errors when updating a post with invalid id", async () => {
    const res = await request(app)
      .put("/post/invalid-id")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        title: "Updated Post",
        content: "This is an updated test post",
        user_id: testUser._id,
      });

    expect(res.status).toBe(400);
  });

  it("should handle errors when deleting a post with invalid id", async () => {
    const res = await request(app)
      .delete("/post/invalid-id")
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(400);
  });
});
