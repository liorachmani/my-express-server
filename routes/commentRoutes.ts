import express from "express";
import { CommentController } from "../controllers/comment";
import { verifyUserOnEntity } from "../middlewares/verifyUserOnEntity";
import comment, { IComment } from "../models/comment";
import { authenticate } from "../middlewares";

const router = express.Router();
const verifyCommentUser = verifyUserOnEntity<IComment>(comment);

router.post(
  "/",
  authenticate,
  CommentController.createComment
);
router.get("/", CommentController.getComments);
router.get("/:id", CommentController.getCommentById);
router.put(
  "/:id",
  authenticate,
  verifyCommentUser,
  CommentController.updateComment
);
router.delete(
  "/:id",
  authenticate,
  verifyCommentUser,
  CommentController.deleteComment
);

export default router;
