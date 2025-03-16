import { Request, Response } from "express";
import Post, { IPost } from "../models/post";
import { JwtPayload } from "jsonwebtoken";
import { geminiModel } from "../utils/ai";

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
  const senderId = req.query.sender as string;
  Post;
  try {
    let posts: IPost[];
    if (senderId) {
      posts = await Post.find({ user_id: senderId }).sort({ _id: -1 });
    } else {
      posts = await Post.find().sort({ _id: -1 });
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Get all posts - GET /post/suggestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getPostSuggestion = async (req: Request, res: Response) => {
  try {
    const prompt = "generate a title and content in hebrew to a post in social media website. give interesting and unique subjects. provide the response strictly in JSON format with title and content fields, do not include any additional text outisde the JSON."
    const suggestion = await geminiModel.generateContent(prompt);
    const suggestionJson = JSON.parse(suggestion.response.text().replace(/^```json\n/, '').replace(/\n```$/, ''))  

    res.status(200).json(suggestionJson);
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
  getPostSuggestion
};
