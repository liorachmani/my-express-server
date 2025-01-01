import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const enum TOKEN_TYPE {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
}

const tokens = [
  {
    secret: process.env.SERVER_ACCESS_TOKEN_SECRET,
    expiration: process.env.SERVER_ACCESS_TOKEN_EXPIRATION,
  },
  {
    secret: process.env.SERVER_REFRESH_TOKEN_SECRET,
    expiration: process.env.SERVER_REFRESH_TOKEN_EXPIRATION,
  },
];

export const createToken = (id: Types.ObjectId, type: TOKEN_TYPE) => {
  const { secret, expiration } = tokens[type];
  if (!secret) {
    console.log("Access token secret is not defined");
    return;
  }

  // Add timestamp to the sign to make the token unique
  const timestamp = Date.now();
  return jwt.sign({ id, timestamp }, secret, {
    expiresIn: expiration,
  });
};
