import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

/**
 * Upload a file - POST /file
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const uploadFile = async (req: Request, res: Response) => {
  const base =
    "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";

  if (req.file) {
    res.status(200).json({ url: base + req.file.path });
  } else {
    res.status(400).json({ error: "File not provided" });
  }
};

export const FileController = {
  uploadFile,
};
