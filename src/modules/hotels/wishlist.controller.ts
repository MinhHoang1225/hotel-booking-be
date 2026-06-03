import type { Request, Response } from "express";
import { wishlistService } from "./wishlist.service";

export async function toggleWishlist(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { hotelId } = req.body;
  const data = await wishlistService.toggleWishlist(userId, hotelId);
  res.json({ success: true, ...data });
}

export async function getMyWishlist(req: Request, res: Response) {
  const hotels = await wishlistService.getMyWishlist((req as any).user.id);
  res.json({ success: true, data: hotels });
}
