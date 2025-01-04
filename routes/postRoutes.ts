import { authenticate } from "./../middlewares";
import express from "express";
import { PostController } from "../controllers/post";
const router = express.Router();

router.post("/", authenticate, PostController.createPost);
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", authenticate, PostController.updatePost);

export default router;
