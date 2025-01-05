import mongoose, { Types } from "mongoose";

export interface IUserInfo {
  firstName: string;
  lastName: string;
}

export interface IUser extends IUserInfo {
  email: string;
  password: string;
  userName: string;
  refreshTokens?: string[];
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

export default mongoose.model<IUser & mongoose.Document<Types.ObjectId>>(
  "User",
  userSchema
);
