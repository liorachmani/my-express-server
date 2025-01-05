import jwt from "jsonwebtoken";
import { Document, Types } from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "../models/user";
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

export const verifyToken = (refreshToken: string) => {
  return new Promise<IUser & Document<unknown, {}, IUser>>(
    (resolve, reject) => {
      if (!process.env.SERVER_REFRESH_TOKEN_SECRET) {
        reject("Missing auth secret");
        return;
      }

      if (!refreshToken) {
        reject("No refresh token");
        return;
      }

      jwt.verify(
        refreshToken,
        process.env.SERVER_REFRESH_TOKEN_SECRET,
        async (err, payload) => {
          if (err) {
            reject(err.message);
            return;
          }
          const userId = (payload as jwt.JwtPayload & { id: Types.ObjectId })
            .id;
          try {
            const user = await User.findById(userId);
            if (!user) {
              reject("Invalid request");
              return;
            }
            if (
              !user?.refreshTokens ||
              !user.refreshTokens.includes(refreshToken)
            ) {
              user.refreshTokens = [];
              await user.save();
              reject("Invalid request");
              return;
            }

            user.refreshTokens.splice(
              user.refreshTokens.indexOf(refreshToken),
              1
            );
            resolve(user);
          } catch (err) {
            reject(err);
          }
        }
      );
    }
  );
};
