import mongoose, { Model } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export const verifyUserOnEntity = <T extends { user_id: string }>(
  model: Model<T & mongoose.Document>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const entityId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      res.status(400).json({ message: "invalid entity id" });
      return;
    }

    const entity = await model.findById(entityId);

    if (!entity) {
      res.status(404).json({ message: `Entity ${entityId} not found` });
      return;
    }

    if (entity?.user_id) {
      const requestUserId = (req.user as JwtPayload).id;

      if (entity.user_id.toString() !== requestUserId) {
        res.status(403).json({ message: "forbidden" });
        return;
      }
    }

    next();
  };
};
