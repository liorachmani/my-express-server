import { Request, Response } from "express";
import Comment, { IComment } from "../models/comment";
import { JwtPayload } from "jsonwebtoken";

/**
 * Create a new comment - POST /comment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createComment = async (
  req: Request<{}, {}, IComment>,
  res: Response
): Promise<void> => {
  try {
    const comment = req.body;
    const userId = (req.user as JwtPayload).id;

    const newComment = new Comment({ ...comment, user_id: userId });

    // Mongoose will generate an _id for the new comment
    const newCommentDocument = await newComment.save();
    res.status(200).json(newCommentDocument);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Get all comments - GET /comment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Array of comment objects
 */
const getComments = async (req: Request, res: Response): Promise<void> => {
  const postId = req.query.postId as string;

  try {
    let comments: IComment[];
    if (postId) {
      comments = await Comment.find({ post_id: postId }).populate("user_id");
    } else {
      comments = await Comment.find();
    }

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Get a comment by ID - GET /comment/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - comment object
 */
const getCommentById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const comment = await Comment.findById(id);
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Update a comment - PUT /comment/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Updated comment object
 */
const updateComment = async (req: Request, res: Response): Promise<void> => {
  const commentId = req.params.id;

  try {
    const comment = req.body;
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId },
      comment,
      {
        new: true,
      }
    );
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * delete a comment - DELETE /comment/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - deleted comment
 */
const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const commentId = req.params.id;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    res.status(200).json(deletedComment);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const CommentController = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
};
