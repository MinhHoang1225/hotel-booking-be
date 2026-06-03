import type { Request, Response } from "express";
import * as service from "./review.service";

export async function createReview(req: Request, res: Response) {
  const data = await service.createReview(req.user, req.body);
  res.status(201).json({ success: true, data });
}

export async function updateReview(req: Request, res: Response) {
  const data = await service.updateReview(req.user, req.params.id, req.body);
  res.json({ success: true, data });
}

export async function deleteReview(req: Request, res: Response) {
  const data = await service.deleteReview(req.user, req.params.id);
  res.json({ success: true, data });
}

export async function listByHotel(req: Request, res: Response) {
  const data = await service.listByHotel(req.params.hotelId);
  res.json({ success: true, data });
}

export async function replyToReview(req: Request, res: Response) {
  const data = await service.replyToReview(
    req.user,
    req.params.id,
    req.body.reply,
  );
  res.json({ success: true, data });
}

export async function listMyHotelReviews(req: Request, res: Response) {
  const data = await service.listMyHotelReviews(req.user.id);
  res.json({ success: true, data });
}
