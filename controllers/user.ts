import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/user";
import { isValidEmail } from '../utils/validation'

/**
 * Create a new user - POST /user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const register = async (req: Request<{}, {}, IUser>, res: Response) => {
  try {
    const user = req.body;

    if (!isValidEmail(user.email)) {
      res.status(422).json({ message: `User's email invalid: ${user.email}` });
      return;
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: user.email,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const newUserDocument = await newUser.save();
    res
      .status(200)
      .json({ message: `User ${newUserDocument._id} created successfully` });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const UserController = { register };
