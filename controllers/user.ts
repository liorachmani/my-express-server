import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/user";
import { isValidEmail } from "../utils/validation";
import { parseUserInfo, userInfoProjection } from "../utils/user";

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

/**
 * Get a user by ID - GET /user/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - user object
 */
const getUserById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, userInfoProjection);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * Update a user - PUT /user/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Updated user object
 */
const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      parseUserInfo(user),
      {
        new: true,
        projection: userInfoProjection,
      }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 * delete a user - DELETE /user/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - deleted user id
 */
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId, {
      projection: userInfoProjection,
    });

    if (!deletedUser) {
      res.status(404).json({ message: `user ${userId} not found` });
    } else {
      res.status(200).json(deletedUser);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

export const UserController = { register, getUserById, updateUser, deleteUser };
