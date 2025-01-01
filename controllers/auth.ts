import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { TOKEN_TYPE, createToken } from "./utils";
import { Types } from "mongoose";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstname, lastname, username } = req.body;

    if (!(email && password && firstname && lastname && username)) {
      res.status(400).send("All fields are required");
      return;
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      res.status(409).send("User Already Exist. Please Login");
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const accessToken = createToken(user._id, TOKEN_TYPE.ACCESS_TOKEN);
    const refreshToken = createToken(user._id, TOKEN_TYPE.REFRESH_TOKEN);
    user.refreshTokens = [refreshToken as string];
    await user.save();

    res.cookie("accessToken", accessToken, {
      path: "/",
      expires: new Date(Date.now() + 86400000),
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    console.log("cookie set successfully");

    res.status(201).send(user);
  } catch (error) {
    console.error("Got an error", error);
    res.status(500).send("Internal Server Error");
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await User.findOne({ email });

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      res.status(404).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = createToken(user._id, TOKEN_TYPE.ACCESS_TOKEN);
    const refreshToken = createToken(user._id, TOKEN_TYPE.REFRESH_TOKEN);

    if (!accessToken || !refreshToken) {
      res.status(500).send("Internal Server Error");
      return;
    }

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie("accessToken", accessToken, {
      // domain: process.env.frontend_url,
      path: "/",
      // expires: new Date(Date.now() + 86400000),
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Got an error", error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("accessToken");

  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  if (!process.env.SERVER_REFRESH_TOKEN_SECRET) {
    res.status(400).send("Missing auth secret");
    return;
  }

  jwt.verify(
    token,
    process.env.SERVER_REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        res.status(403).send(err.message);
        return;
      }

      const userId = (user as JwtPayload & { id: Types.ObjectId }).id;
      try {
        const user = await User.findById(userId);
        if (user == null) return res.status(403).send("Invalid request");
        if (!user?.refreshTokens || !user.refreshTokens.includes(token)) {
          user.refreshTokens = []; // Invalidate all user refreshTokens
          await user.save();
          res.status(403).send("Invalid request");
          return;
        }
        user.refreshTokens.splice(user.refreshTokens.indexOf(token), 1);
        await user.save();
        res.status(200).send("Logged out successfully");
      } catch (err) {
        res.status(403).send(err);
      }
    }
  );
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  const existingRefreshToken = req.body.refreshToken;
  if (!existingRefreshToken) {
    res.status(400).send("No refresh token");
    return;
  }

  if (!process.env.SERVER_REFRESH_TOKEN_SECRET) {
    res.status(400).send("Missing auth secret");
    return;
  }

  jwt.verify(
    existingRefreshToken,
    process.env.SERVER_REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        res.status(403).send(err.message);
        return;
      }
      const userId = (user as JwtPayload & { id: Types.ObjectId }).id;
      try {
        const user = await User.findById(userId);
        if (user == null) {
          res.status(403).send("Invalid request");
          return;
        }
        if (
          !user?.refreshTokens ||
          !user.refreshTokens.includes(existingRefreshToken)
        ) {
          user.refreshTokens = [];
          await user.save();
          res.status(403).send("Invalid request");
          return;
        }
        const accessToken = createToken(userId, TOKEN_TYPE.ACCESS_TOKEN);
        const refreshToken = createToken(userId, TOKEN_TYPE.REFRESH_TOKEN);

        if (!accessToken || !refreshToken) {
          res.status(500).send("Internal Server Error");
          return;
        }

        user.refreshTokens[user.refreshTokens.indexOf(refreshToken)] =
          refreshToken;
        await user.save();
        res.status(200).send({ accessToken, refreshToken });
      } catch (err) {
        res.status(403).send(err);
      }
    }
  );
};

export const AuthController = { register, login, logout, refreshToken };
