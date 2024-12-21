import express from "express";
import { PostController } from "../controllers/post";
const router = express.Router();

router.post("/", PostController.createPost);
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", PostController.updatePost);

export default router;
