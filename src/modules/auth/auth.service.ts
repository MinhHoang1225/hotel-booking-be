import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../common/AppError";
import { RegisterInput, LoginInput, GoogleLoginInput } from "./dto/auth.dto";

const client = new OAuth2Client(env.googleClientId);

const signToken = (user: any) => {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  });
};

const sanitizeUser = (user: any) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const register = async (payload: RegisterInput) => {
  const existed = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existed) {
    console.error(`[Register Error]: Email ${payload.email} đã tồn tại.`);
    throw new AppError(
      409,
      "Email này đã được đăng ký, vui lòng sử dụng email khác.",
    );
  }

  const { password, ...userData } = payload;
  const user = await prisma.user.create({
    data: {
      ...userData,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  return { user: sanitizeUser(user), token: signToken(user) };
};

export const login = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    console.error(
      `[Login Error]: Không tìm thấy user với email ${payload.email}`,
    );
    throw new AppError(401, "Email không tồn tại trong hệ thống.");
  }

  if (!user.passwordHash) {
    console.error(
      `[Login Error]: User ${payload.email} đăng ký qua Google, không có mật khẩu.`,
    );
    throw new AppError(
      401,
      "Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google.",
    );
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) {
    console.error(`[Login Error]: Sai mật khẩu cho email ${payload.email}`);
    throw new AppError(401, "Mật khẩu không chính xác.");
  }

  return { user: sanitizeUser(user), token: signToken(user) };
};

export const loginGoogle = async (idToken: string, role: string) => {
  let payload;

  // 1. Xác thực idToken từ Google gửi lên
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error: any) {
    console.error(
      `[Google Auth Error]: Xác thực token thất bại - ${error.message}`,
    );
    throw new AppError(401, "Token Google không hợp lệ hoặc đã hết hạn.");
  }

  if (!payload || !payload.email) {
    throw new AppError(
      400,
      "Không thể lấy thông tin email từ tài khoản Google này.",
    );
  }

  const { email, sub: googleId, name, picture } = payload;

  // 2. Tìm hoặc tạo User (Upsert logic)
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    // Kiểm tra xem email đã tồn tại qua đăng ký thường chưa
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      console.log(`[Google Auth]: Liên kết GoogleId cho user có sẵn: ${email}`);
      user = await prisma.user.update({
        where: { id: existingEmail.id },
        data: { googleId, avatarUrl: picture },
      });
    } else {
      console.log(`[Google Auth]: Tạo tài khoản mới từ Google: ${email}`);
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          fullName: name || email,
          googleId,
          avatarUrl: picture,
          role: role as any,
          // passwordHash để trống vì login qua GG
        },
      });
    }
  }

  // 3. Tạo JWT của hệ thống bạn
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
};

export const updateProfile = async (
  userId: string,
  payload: { fullName?: string; avatar?: string },
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.fullName && { fullName: payload.fullName }),
      ...(payload.avatar && { avatarUrl: payload.avatar }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
    },
  });

  return updatedUser;
};
