import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import { TOKEN_TYPE, createToken, verifyToken } from "../utils/authentication";
import { Types } from "mongoose";

const register = async (
  req: Request<{}, IUser, IUser>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, userName } = req.body;

    if (!(email && password && firstName && lastName && userName)) {
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
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

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

    res.json({ _id: user._id, accessToken, refreshToken });
  } catch (error) {
    console.error("Got an error", error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingRefreshToken = req.body.refreshToken;
    const user = await verifyToken(existingRefreshToken);
    await user.save();
    res.status(200).send("Logged out successfully");
  } catch (error) {
    console.error("Got an error", error);
    res.status(500).send("Internal Server Error");
  }
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingRefreshToken = req.body.refreshToken;
    const user = await verifyToken(existingRefreshToken);

    if (!user?.refreshTokens) {
      user.refreshTokens = [];
    }

    const userId = user._id as Types.ObjectId;
    const accessToken = createToken(userId, TOKEN_TYPE.ACCESS_TOKEN);
    const refreshToken = createToken(userId, TOKEN_TYPE.REFRESH_TOKEN);

    if (!accessToken || !refreshToken) {
      res.status(500).send("Internal Server Error");
      return;
    }

    user.refreshTokens.push(refreshToken);
    await user.save();
    res.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    res.status(403).send(error);
  }
};

export const AuthController = { register, login, logout, refreshToken };
