import { authenticate } from "./../middlewares";
import express from "express";
import { PostController } from "../controllers/post";
import { verifyUserOnEntity } from "../middlewares/verifyUserOnEntity";
import post, { IPost } from "../models/post";

const router = express.Router();
const verifyPostUser = verifyUserOnEntity<IPost>(post);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - user_id
 *       optional:
 *        - image
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         user_id:
 *           type: string
 *           description: The user id of the post author
 *       example:
 *         _id: 67474a3d2651e79673ab702f
 *         title: My Post
 *         content: This is the content of the post
 *         user_id: 6778f7f548cb7802a935f9a4
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *               image:
 *                 type: string
 *                 description: The image URL of the post
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, PostController.createPost);

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     parameters:
 *      - name: sender
 *        in: query
 *        required: false
 *        description: A filter to narrow down items by sender.
 *        schema:
 *          type: string
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Returns a list of posts. If no query parameters are provided, returns all items. If query parameters are provided, returns filtered items based on the parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get("/", PostController.getPosts);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single post by its ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get("/:id", PostController.getPostById);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post by ID
 *     description: Update a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *               image:
 *                 type: string
 *                 description: The image URL of the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden to update the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, verifyPostUser, PostController.updatePost);

/**
 * @swagger
 * /post/{id}/like:
 *   put:
 *     summary: likes a post by ID
 *     description: likes a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden to like the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/:id/like", authenticate, PostController.likePost);

/**
 * @swagger
 * /post/{id}/unlike:
 *   put:
 *     summary: unlike a post by ID
 *     description: unlikes a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden to unlike the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/:id/unlike", authenticate, PostController.unlikePost);

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Delete a single post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: The deleted post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden to delete the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, verifyPostUser, PostController.deletePost);

export default router;
