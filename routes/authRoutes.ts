import express from "express";
import { AuthController } from "../controllers/auth";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

export default router;
