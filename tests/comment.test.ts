import request from "supertest";
import mongoose from "mongoose";
import * as core from "express-serve-static-core";
import Post from "../models/post";
import Comment from "../models/comment";
import initApp from "../server";
import User, { IUser } from "../models/user";

const testUser: Partial<IUser & { token: string; _id: string }> = {
  email: "test@gmail.com",
  password: "password",
  firstName: "John",
  lastName: "Doe",
  userName: "johndoe",
};
let postId: string;

describe("CommentController", () => {
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

    const post = new Post({
      title: "Test Post",
      content: "This is a test post",
      user_id: testUser._id,
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
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it("should create a new comment", async () => {
    const res = await request(app)
      .post("/comment")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "comment message",
        post_id: postId,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Comment .* created successfully/);
  });

  it("should get all comments", async () => {
    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    const comment2 = new Comment({
      message: "comment message 2",
      post_id: postId,
      user_id: testUser._id,
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
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app).get(`/comment/${comment._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("comment message");
  });

  it("should get all comments by post id", async () => {
    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app).get(`/comment?postId=${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should update a comment", async () => {
    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app)
      .put(`/comment/${comment._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "new comment message",
        post_id: postId,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("new comment message");
  });

  it("should delete a comment", async () => {
    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app)
      .delete(`/comment/${comment._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("comment message");

    const allCommentsRes = await request(app).get("/comment");

    expect(allCommentsRes.body.length).toBe(0);
  });

  it("should handle errors when creating a comment", async () => {
    jest.spyOn(Comment.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .post("/comment")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "comment message",
        post_id: postId,
      });

    expect(res.status).toBe(500);
  });

  it("should handle errors when creating a comment with invalid post", async () => {
    const res = await request(app)
      .post("/comment")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "comment message",
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

  it("should handle errors when updating a comment with invalid id", async () => {
    const res = await request(app)
      .put("/comment/invalid-id")
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "comment message",
        post_id: postId,
      });

    expect(res.status).toBe(400);
  });

  it("should handle errors when deleting a comment", async () => {
    jest.spyOn(Comment, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app)
      .delete(`/comment/${comment._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      });

    expect(res.status).toBe(500);
  });
  it("should handle errors when updating a comment", async () => {
    jest.spyOn(Comment, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const comment = new Comment({
      message: "comment message",
      post_id: postId,
      user_id: testUser._id,
    });
    await comment.save();

    const res = await request(app)
      .put(`/comment/${comment._id}`)
      .set({
        authorization: `JWT ${testUser.token}`,
      })
      .send({
        message: "comment message",
        post_id: postId,
      });

    expect(res.status).toBe(500);
  });
});
