import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const createToken = (id: Types.ObjectId) => {
  if (!process.env.SERVER_ACCESS_TOKEN_SECRET) {
    console.log("Access token secret is not defined");
    return;
  }
  return jwt.sign({ id }, process.env.SERVER_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION,
  });
};
