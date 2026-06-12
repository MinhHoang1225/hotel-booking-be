import { Request, Response, NextFunction } from "express";
import { roomCompareService } from "./room.compare.service";

export const compareRoomsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ids = req.query.ids;
    let roomIds: string[] = [];

    if (Array.isArray(ids)) {
      roomIds = ids as string[];
    } else if (typeof ids === "string") {
      roomIds = ids.split(",");
    }

    const data = await roomCompareService.compareRooms(roomIds);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
