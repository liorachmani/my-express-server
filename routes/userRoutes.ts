import express from "express";
import { UserController } from "../controllers/user";
const router = express.Router();

router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
