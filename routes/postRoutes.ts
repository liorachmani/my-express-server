import { authenticate } from "./../middlewares";
import express from "express";
import { PostController } from "../controllers/post";
import { verifyUserOnEntity } from "../middlewares/verifyUserOnEntity";
import post, { IPost } from "../models/post";

const router = express.Router();
const verifyPostUser = verifyUserOnEntity<IPost>(post);

router.post("/", authenticate, PostController.createPost);
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", authenticate, verifyPostUser, PostController.updatePost);
router.delete("/:id", authenticate, verifyPostUser, PostController.deletePost);

export default router;
