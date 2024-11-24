import express from "express";
const router = express.Router();
import * as Post from "../controllers/post";

router.post("/", Post.createPost);
router.get("/", Post.getPosts);
router.get("/:id", Post.getPostById);
router.put("/:id", Post.updatePost);

export default router;
