import { Request, Response } from "express";
import Post from "../models/post";
import { InferSchemaType } from "mongoose";

type PostModel = InferSchemaType<typeof Post>;

/**
 * Create a new post - POST /post
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createPost = async (req: Request<{}, PostModel>, res: Response) => {
  try {
    const post = req.body;
    const newPost = new Post(post);

    // Mongoose will generate an _id for the new post
    const newPostDocument = await newPost.save();
    res
      .status(200)
      .json({ message: `Post ${newPostDocument._id} created successfully` });
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Get all posts - GET /post
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getPosts = async (req: Request, res: Response) => {
  const senderId = req.query.sender as string;

  try {
    let posts: (typeof Post)[];
    if (senderId) {
      posts = await Post.find({ sender_id: senderId });
    } else {
      posts = await Post.find();
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a post by ID - GET /post/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getPostById = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update a post - PUT /post/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;

  try {
    const post = req.body;
    const updatedPost = await Post.findOneAndUpdate({ _id: postId }, post, {
      new: true,
    });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const PostController = { createPost, getPosts, getPostById, updatePost };
