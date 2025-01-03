import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import Post, { IPost } from "../models/post";
import Comment from "../models/comment";
import initApp from "../server";

describe("CommentController", () => {
  let app: core.Express;
  let postId: string;
  beforeAll(async () => {
    app = await initApp();
    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      sender_id: "12345",
    });
    await post.save();

    postId = post._id as string;
  });
  afterEach(async () => {
    // Clean up the database after each test
    await Comment.deleteMany({});
  });
  afterAll(async () => {
    // Disconnect from the test database
    await Post.deleteMany({});
    await mongoose.disconnect();
  });

  it("should create a new comment", async () => {
    const res = await request(app).post("/comment").send({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Comment .* created successfully/);
  });

  it("should get all comments", async () => {
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    const comment2 = new Comment({
      message: "comment message 2",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();
    await comment2.save();

    const res = await request(app).get("/comment");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should get comment by id", async () => {
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();

    const res = await request(app).get(`/comment/${comment._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("comment message");
  });

  it("should get all comments by post id", async () => {
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();

    const res = await request(app).get(`/comment?postId=${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should update a comment", async () => {
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();

    const res = await request(app).put(`/comment/${comment._id}`).send({
      message: "new comment message",
      sender_id: "123456",
      post_id: postId,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("new comment message");
  });

  it("should delete a comment", async () => {
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();

    const res = await request(app).delete(`/comment/${comment._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("comment message");

    const allCommentsRes = await request(app).get("/comment");

    expect(allCommentsRes.body.length).toBe(0);
  });

  it("should handle errors when creating a comment", async () => {
    jest.spyOn(Comment.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).post("/comment").send({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });

    expect(res.status).toBe(500);
  });

  it("should handle errors when creating a comment with invalid post", async () => {
    const res = await request(app).post("/comment").send({
      message: "comment message",
      sender_id: "12345",
      post_id: "dsgbkjdas",
    });

    expect(res.status).toBe(500);
  });

  it("should handle errors when getting comments", async () => {
    jest.spyOn(Comment, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/comment");

    expect(res.status).toBe(500);
  });

  it("should handle errors when getting a comment by ID", async () => {
    const res = await request(app).get("/comment/invalid-id");

    expect(res.status).toBe(500);
  });

  it("should handle errors when updating a comment", async () => {
    const res = await request(app).put("/comment/invalid-id").send({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });

    expect(res.status).toBe(500);
  });

  it("should handle errors when deleting a comment", async () => {
    jest.spyOn(Comment, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });
    
    const comment = new Comment({
      message: "comment message",
      sender_id: "12345",
      post_id: postId,
    });
    await comment.save();

    const res = await request(app).delete(`/comment/${comment._id}`);

    expect(res.status).toBe(500);
  });
});
