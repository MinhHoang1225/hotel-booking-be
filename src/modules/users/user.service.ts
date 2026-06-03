import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";

export const userService = {
  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, createdAt: true }
    });
    if (!user) throw new AppError(404, "Người dùng không tồn tại.");
    return user;
  },

  async listUsers(user: any, query: any) {
    if (user.role !== "ADMIN") {
      throw new AppError(403, "Chỉ quản trị viên mới có quyền xem danh sách người dùng.");
    }
    
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      }
    });
  },

  async updateUserRole(adminUser: any, userId: string, role: string) {
    if (adminUser.role !== "ADMIN") {
      throw new AppError(403, "Chỉ quản trị viên mới có quyền cập nhật người dùng.");
    }
    
    if (adminUser.id === userId) {
      throw new AppError(400, "Không thể tự thay đổi quyền của chính mình.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      }
    });
    
    return updatedUser;
  },

  async deleteUser(adminUser: any, userId: string) {
    if (adminUser.role !== "ADMIN") {
      throw new AppError(403, "Chỉ quản trị viên mới có quyền xóa người dùng.");
    }
    if (adminUser.id === userId) {
      throw new AppError(400, "Không thể tự xóa tài khoản của chính mình.");
    }
    return await prisma.user.delete({ where: { id: userId } });
  }
};
