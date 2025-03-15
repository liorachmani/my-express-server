import { IUser, IUserInfo } from "../models/user";

export const parseUserInfo = (user: IUser): IUserInfo => ({
  firstName: user.firstName,
  lastName: user.lastName,
  userName: user.userName,
});

export const userInfoProjection = {
  _id: 1,
  lastName: 1,
  firstName: 1,
  userName: 1,
  image: 1,
};
