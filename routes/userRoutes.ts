import express from "express";
import { UserController } from "../controllers/user";
import { authenticate } from "../middlewares/authenticate";
const router = express.Router();

/**
* @swagger
* tags:
*   name: Users
*   description: The Users API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInfo:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - userName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         firstName:
 *           type: string
 *           description: The firstName of the user
 *         lastName:
 *           type: string
 *           description: The lastName of the user
 *         userName:
 *           type: string
 *           description: The userName of the user   
 *       example:
 *         _id: 67474a3d2651e79673ab702f
 *         firstName: ido
 *         lastName: w
 *         userName: idow
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       allOf:
 *         - $ref: '#/components/schemas/UserInfo'
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         _id: 67474a3d2651e79673ab702f
 *         email: ido@gmail.com
 *         password: 12345
 *         firstName: ido
 *         lastName: w
 *         userName: idow
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user info by ID
 *     description: Retrieve a user info by its ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       500:
 *         description: Server error
 */
router.get("/:id", UserController.getUserById);

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update the authorized user
 *     description: Update the authorized user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The firstName of the user
 *               lastName:
 *                 type: string
 *                 description: The lastName of the user
 *               userName:
 *                 type: string
 *                 description: The userName of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put("/", authenticate, UserController.updateUser);

/**
 * @swagger
 * user:
 *   delete:
 *     summary: Delete the authorized user
 *     description: Delete the authorized user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The deleted user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete("/", authenticate, UserController.deleteUser);

export default router;
