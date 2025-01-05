import { Request, Response } from "express";
import User from "../models/user";
import { parseUserInfo, userInfoProjection } from "../utils/user";
import { JwtPayload } from "jsonwebtoken";

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
 * Update a user - PUT /user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Updated user object
 */
const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as JwtPayload).id;

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
 * delete a user - DELETE /user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - deleted user id
 */
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as JwtPayload).id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId, {
      projection: userInfoProjection,
    });

    res.status(200).json(deletedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const UserController = { getUserById, updateUser, deleteUser };
