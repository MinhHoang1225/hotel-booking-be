import { Request, Response } from "express";
import * as authService from "./auth.service";
import { ApiResponse } from "../../common/ApiResponse";

const setTokenCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setTokenCookie(res, result.token);
  res.status(201).json(ApiResponse.success(result, "Registered successfully"));
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setTokenCookie(res, result.token);
  res.status(200).json(ApiResponse.success(result, "Login successful"));
};

export const loginGoogle = async (req: Request, res: Response) => {
  const result = await authService.loginGoogle(req.body.idToken, req.body.role);
  setTokenCookie(res, result.token);
  res.status(200).json(ApiResponse.success(result, "Google login successful"));
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json(ApiResponse.success(null, "Logout successful"));
};

export const me = async (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success((req as any).user));
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await authService.updateProfile(user.id, req.body);
  res
    .status(200)
    .json(ApiResponse.success(result, "Cập nhật hồ sơ thành công"));
};
