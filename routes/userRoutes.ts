import express from "express";
import { UserController } from "../controllers/user";
import { authenticate } from "../middlewares/authenticate";
const router = express.Router();

router.get("/:id", UserController.getUserById);
router.put("/", authenticate, UserController.updateUser);
router.delete("/", authenticate, UserController.deleteUser);

export default router;
