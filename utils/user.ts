import { IUser, IUserInfo } from "../models/user";

export const parseUserInfo = (user: IUser): IUserInfo => ({
  firstName: user.firstName,
  lastName: user.lastName,
});

export const userInfoProjection = {
  _id: 1,
  lastName: 1,
  firstName: 1,
};
