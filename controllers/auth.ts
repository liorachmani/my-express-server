import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { createToken } from "./utils";

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
    const token = createToken(user._id);

    res.cookie("token", token, {
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

    const token = createToken(user._id);

    res.cookie("token", token, {
      domain: process.env.frontend_url,
      path: "/",
      expires: new Date(Date.now() + 86400000),
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    res.json({ token });
  } catch (error) {
    console.error("Got an error", error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).send("Logged out successfully");
};

export const AuthController = { register, login, logout };
