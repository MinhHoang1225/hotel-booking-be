import type { Request, Response } from "express";
import { roomService as service } from "./room.service";

export async function createRoom(req: Request, res: Response) {
  const data = await service.createRoom((req as any).user, req.body);
  res.status(201).json({ success: true, data });
}

export async function deleteRoom(req: Request, res: Response) {
  const data = await service.deleteRoom((req as any).user, req.params.id as string);
  res.json({ success: true, data });
}

export async function listHotelRooms(req: Request, res: Response) {
  const { checkIn, checkOut } = req.query;
  const data = await service.listHotelRooms(
    req.params.hotelId as string,
    checkIn as string,
    checkOut as string,
  );
  res.json({ success: true, data });
}

export async function getRoom(req: Request, res: Response) {
  const data = await service.getRoom(req.params.id as string);
  res.json({ success: true, data });
}

export async function updateRoom(req: Request, res: Response) {
  const data = await service.updateRoom(
    (req as any).user,
    req.params.id as string,
    req.body,
  );
  res.json({ success: true, data });
}
