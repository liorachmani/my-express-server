import Comment from "../models/comment";

/**
 * Create a new comment - POST /comment
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createComment = async (req, res) => {
  try {
    const comment = req.body;
    const newComment = new Comment(comment);

    // Mongoose will generate an _id for the new comment
    const newCommentDocument = await newComment.save();
    res.status(200).json({
      message: `Comment ${newCommentDocument._id} created successfully`,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Get all comments - GET /comment
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {array} - Array of comment objects
 */
const getComments = async (req, res) => {
  const postId = req.query.postId;

  try {
    let comments;
    if (postId) {
      comments = await Comment.find({ post_id: postId });
    } else {
      comments = await Comment.find();
    }

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a comment by ID - GET /comment/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - comment object
 */
const getCommentById = async (req, res) => {
  const id = req.params.id;

  try {
    const comment = await Comment.findById(id);
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update a comment - PUT /comment/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Updated comment object
 */
const updateComment = async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
};

/**
 * delete a comment - DELETE /comment/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - deleted comment
 */
const deleteComment = async (req, res) => {
  const commentId = req.params.id;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    res.status(200).json(deletedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const CommentController = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
};
