import express from "express";
import { CommentController } from "../controllers/comment";

const router = express.Router();

router.post("/", CommentController.createComment);
router.get("/", CommentController.getComments);
router.get("/:id", CommentController.getCommentById);
router.put("/:id", CommentController.updateComment);
router.delete("/:id", CommentController.deleteComment);

export default router;
