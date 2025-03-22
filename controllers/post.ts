import { Request, Response } from "express";
import Post, { IPost } from "../models/post";
import { JwtPayload } from "jsonwebtoken";

/**
 * Create a new post - POST /post
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createPost = async (req: Request<{}, {}, IPost>, res: Response) => {
  try {
    const post = req.body;
    const userId = (req.user as JwtPayload).id;

    const newPost = new Post({ ...post, user_id: userId });

    // Mongoose will generate an _id for the new post
    const newPostDocument = await newPost.save();
    res
      .status(201)
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
  try {
    const senderId = req.query.sender as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter = senderId ? { user_id: senderId } : {};

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts: IPost[] = await Post.find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    res.status(500).json(err);
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
    res.status(500).json(err);
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
    res.status(500).json(err);
  }
};

/**
 * likes a post - PUT /post/:id/like
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const likePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = (req.user as JwtPayload).id;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * unlikes a post - PUT /post/:id/unlike
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const unlikePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = (req.user as JwtPayload).id;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Delete a post - DELETE /post/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;

  try {
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: `Post ${postId} deleted successfully` });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const PostController = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
