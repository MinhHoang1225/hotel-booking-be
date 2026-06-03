import type { Request, Response } from "express";
import * as service from "./payment.service";

export async function createPayment(req: Request, res: Response) {
  const data = await service.createPayment(req.user, req.body);
  res.status(201).json({ success: true, data });
}

