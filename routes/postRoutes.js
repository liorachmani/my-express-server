const express = require("express");
const router = express.Router();
const Post = require("../controllers/post");

router.post("/", Post.createPost);
router.get("/", Post.getPosts);
router.get("/:id", Post.getPostById);
router.put("/:id", Post.updatePost);

module.exports = router;
