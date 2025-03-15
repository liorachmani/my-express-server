import express from "express";
import { FileController } from "../controllers/file";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file
 *     description: Upload a single file to the server and get a URL to access the uploaded file.
 *     tags:
 *       - File
 *     requestBody:
 *       content:
 *         image/*:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Successfully uploaded the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL to access the uploaded file.
 *       400:
 *         description: File not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when file is not provided.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for internal issues.
 */
router.post("/", upload.single("file"), FileController.uploadFile as any);

export default router;
