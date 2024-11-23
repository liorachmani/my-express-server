const Post = require("../models/post");

/**
 * Create a new post - POST /post
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createPost = async (req, res) => {
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {array} - Array of post objects
 */
const getPosts = async (req, res) => {
  const senderId = req.query.sender;

  try {
    let posts;
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Post object
 */
const getPostById = async (req, res) => {
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Updated post object
 */
const updatePost = async (req, res) => {
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
};
