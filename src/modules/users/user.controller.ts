import { Request, Response } from "express";
import { userService } from "./user.service";
import { ApiResponse } from "../../common/ApiResponse";

export const getUser = async (req: Request, res: Response) => {
  const user = await userService.getUser(req.params.id as string);
  res.status(200).json(ApiResponse.success(user));
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await userService.listUsers((req as any).user, req.query);
  res.status(200).json(ApiResponse.success(users));
};

export const updateUserRole = async (req: Request, res: Response) => {
  const user = await userService.updateUserRole(
    (req as any).user,
    req.params.id as string,
    req.body.role,
  );
  res.status(200).json(ApiResponse.success(user, "Cập nhật quyền thành công"));
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUser((req as any).user, req.params.id as string);
  res.status(200).json(ApiResponse.success(null, "Xóa người dùng thành công"));
};
