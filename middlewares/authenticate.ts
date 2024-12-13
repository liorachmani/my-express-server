import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).send("Access denied!");
    return;
  }
  if (!process.env.SERVER_ACCESS_TOKEN_SECRET) {
    res.status(500).send("Internal Server Error");
    return;
  }
  jwt.verify(token, process.env.SERVER_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).send("Invalid token");
      return;
    }
    req.user = user;
    next();
  });
};
