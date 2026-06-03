import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import { ApiResponse } from "../../common/ApiResponse";

export const getMyNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifications = await notificationService.getUserNotifications(user.id);
  res.status(200).json(ApiResponse.success(notifications));
};

export const markAsRead = async (req: Request, res: Response) => {
  const user = (req as any).user;
  await notificationService.markAsRead(user.id, req.params.id as string);
  res.status(200).json(ApiResponse.success(null, "Marked as read"));
};
