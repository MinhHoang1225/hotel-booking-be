import type { Request, Response } from "express";
import { bookingService as service } from "./booking.service";

export async function checkAvailability(req: Request, res: Response) {
  const data = await service.checkAvailability(
    req.query.roomId,
    req.query.checkIn,
    req.query.checkOut,
  );
  res.json({ success: true, data });
}

export async function createBooking(req: Request, res: Response) {
  const data = await service.createBooking(req.user, req.body);
  res.status(201).json({ success: true, data });
}

export async function getBooking(req: Request, res: Response) {
  const data = await service.getBooking(req.user, req.params.id as string);
  res.json({ success: true, data });
}

export async function listBookings(req: Request, res: Response) {
  const data = await service.listBookings(req.user, req.query);
  res.json({ success: true, data });
}

export async function cancelBooking(req: Request, res: Response) {
  const data = await service.cancelBooking(
    req.user,
    req.params.id as string,
    req.body.reason,
  );
  res.json({ success: true, data });
}

export async function expirePendingBookings(_req: Request, res: Response) {
  const data = await service.expirePendingBookings();
  res.json({ success: true, data });
}
