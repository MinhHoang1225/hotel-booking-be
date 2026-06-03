import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "../common/AppError";

const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  // 1. Kiểm tra đầu vào
  if (!schema) {
    return next(new AppError(500, "Validation schema is missing"));
  }

  // 2. Thực hiện parse
  // Lưu ý: Chúng ta parse toàn bộ object chứa body, query, params
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    // Trả về lỗi định dạng đẹp hơn
    const details = result.error.flatten().fieldErrors;
    return next(new AppError(400, "Dữ liệu không hợp lệ", details));
  }

  // 3. Ghi đè lại dữ liệu đã qua xử lý (đã strip các trường thừa, format lại...)
  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};

export { validate };