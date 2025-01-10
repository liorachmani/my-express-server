import express from "express";
import { CommentController } from "../controllers/comment";
import { verifyUserOnEntity } from "../middlewares/verifyUserOnEntity";
import comment, { IComment } from "../models/comment";
import { authenticate } from "../middlewares";

const router = express.Router();
const verifyCommentUser = verifyUserOnEntity<IComment>(comment);

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - message
 *         - user_id
 *         - post_id
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         message:
 *           type: string
 *           description: The message of the comment
 *         user_id:
 *           type: string
 *           description: The user id of the comment author
 *         post_id:
 *           type: string
 *           description: The post id of the comment
 *       example:
 *         _id: 67474a3d2651e79673ab702f
 *         message: My message
 *         user_id: 6778f7f548cb7802a935f9a4
 *         post_id: 677937f96a58d21af8a2827e
 */

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message of the comment
 *               post_id:
 *                 type: string
 *                 description: The post id of the comment
 *             required:
 *               - message
 *               - post_id
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden 
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticate,
  CommentController.createComment
);

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments
 *     parameters:
 *      - name: postId
 *        in: query
 *        required: false
 *        description: A filter to narrow down items.
 *        schema:
 *          type: string
 *     tags:
 *       - Comments
 *     responses:
 *       200:
 *         description: Returns a list of comments. If no query parameters are provided, returns all items. If query parameters are provided, returns filtered items based on the parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get("/", CommentController.getComments);

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a single comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get("/:id", CommentController.getCommentById);

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     description: Update a new comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message of the comment
 *               post_id:
 *                 type: string
 *                 description: The post id of the comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden to update the comment
 *       404:
 *         description: Comment not found 
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authenticate,
  verifyCommentUser,
  CommentController.updateComment
);

/**
 * @swagger
 * comment/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     description: Delete a single comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: The deleted comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden to delete the comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authenticate,
  verifyCommentUser,
  CommentController.deleteComment
);

export default router;
