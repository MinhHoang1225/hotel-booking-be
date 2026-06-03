import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../common/AppError";

async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new AppError(401, "Authentication required");

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, email: true, fullName: true, role: true }
    });
    if (!user) throw new AppError(401, "Invalid token");

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(401, "Invalid token"));
  }
}

function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "Forbidden"));
    next();
  };
}

export { authenticate, authorize };

