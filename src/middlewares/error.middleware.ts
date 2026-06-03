import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../common/AppError";
import { ApiResponse } from "../common/ApiResponse";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} không tồn tại`));
}

export function errorHandler(err: any, req: any, res: any, next: any) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi máy chủ nội bộ";
  let details = null;

  // Log chi tiết dựa trên loại lỗi
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Dữ liệu gửi lên không đúng định dạng";
    details = err.flatten().fieldErrors;
    console.warn(`[Validation Error] ${req.originalUrl}:`, details);
  } else if (statusCode >= 500) {
    console.error(`[System Error] ${req.originalUrl}:`, err);
  } else {
    console.warn(`[Client Error] ${req.originalUrl}: ${message}`);
  }

  res.status(statusCode).json(ApiResponse.error(message, {
    validationErrors: details,
    path: req.originalUrl,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  }));
}