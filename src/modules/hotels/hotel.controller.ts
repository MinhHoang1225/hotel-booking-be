import type { Request, Response } from "express";
import { hotelService as service } from "./hotel.service";

export async function createHotel(req: Request, res: Response) {
  const data = await service.createHotel((req as any).user.id, req.body);
  res.status(201).json({ success: true, data });
}

export async function updateHotel(req: Request, res: Response) {
  const data = await service.updateHotel(req.user, req.params.id as string, req.body);
  res.json({ success: true, data });
}

export async function deleteHotel(req: Request, res: Response) {
  const data = await service.deleteHotel(req.user, req.params.id as string);
  res.json({ success: true, data });
}

export async function approveHotel(req: Request, res: Response) {
  const data = await service.approveHotel(req.params.id as string, req.body.status);
  res.json({ success: true, data });
}

export async function getHotel(req: Request, res: Response) {
  const data = await service.getHotelById(req.params.id as string);
  res.json({ success: true, data });
}

export async function listHotels(req: Request, res: Response) {
  const data = await service.listHotels(req.query);
  res.json({ success: true, ...data });
}

export async function myHotels(req: Request, res: Response) {
  const data = await service.myHotels(req.user, req.query);
  res.json({ success: true, data });
}

export async function uploadHotelImages(req: Request, res: Response) {
  const data = await service.uploadHotelImages(
    req.user,
    req.params.id as string,
    req.files,
  );
  res.json({ success: true, data });
}
