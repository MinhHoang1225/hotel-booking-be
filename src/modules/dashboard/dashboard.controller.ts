import type { Request, Response } from "express";
import * as service from "./dashboard.service";

export async function ownerDashboard(req: Request, res: Response) {
  const data = await service.ownerDashboard(req.user);
  res.json({ success: true, data });
}

export async function adminDashboard(_req: Request, res: Response) {
  const data = await service.adminDashboard();
  res.json({ success: true, data });
}

