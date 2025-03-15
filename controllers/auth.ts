import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import { TOKEN_TYPE, createToken, verifyToken } from "../utils/authentication";
import { Types } from "mongoose";
import { isValidEmail } from "../utils/validation";
import { OAuth2Client } from "google-auth-library";

const register = async (
  req: Request<{}, Omit<IUser, "password">, IUser>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, userName } = req.body;

    if (!(email && password && firstName && lastName && userName)) {
      res.status(400).send("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      res.status(422).json({ message: `User's email invalid: ${email}` });
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
    const userToReturn = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    };

    res.status(201).send(userToReturn);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const client = new OAuth2Client();
const registerGoogle = async (
  req: Request<{}, IUser, { credential: string }>,
  res: Response
): Promise<void> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).send("Invalid Google Token");
      return;
    }

    const { email, given_name, family_name, name } = payload;
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(409).send("User Already Exist. Please Login");
      return;
    }

    const randomHash = await bcrypt.hash(Math.random().toString(), 10);

    const newUser = new User({
      firstName: given_name,
      lastName: family_name,
      userName: name?.split(" ").join("_"),
      email,
      password: randomHash,
    });

    const user = await newUser.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    if (!accessToken || !refreshToken) {
      res.status(500).send("Internal Server Error");
      return;
    }

    user.refreshTokens = [refreshToken];
    await user.save();

    const userToReturn = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    };

    res.status(201).send({ ...userToReturn, accessToken, refreshToken });
  } catch (error) {
    res.status(400).send(error);
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

    const { accessToken, refreshToken } = generateTokens(user._id);
    if (!accessToken || !refreshToken) {
      res.status(500).send("Internal Server Error");
      return;
    }

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }

    user.refreshTokens.push(refreshToken);
    await user.save();

    const userToReturn = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    };

    res.json({ ...userToReturn, accessToken, refreshToken });
  } catch (error) {
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
    console.log(error);
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
    const { accessToken, refreshToken } = generateTokens(userId);
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

const generateTokens = (userId: Types.ObjectId) => {
  const accessToken = createToken(userId, TOKEN_TYPE.ACCESS_TOKEN);
  const refreshToken = createToken(userId, TOKEN_TYPE.REFRESH_TOKEN);

  return { accessToken, refreshToken };
};

export const AuthController = {
  register,
  registerGoogle,
  login,
  logout,
  refreshToken,
};
