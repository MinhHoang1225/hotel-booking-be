import { prisma } from "../../config/prisma";
import type { Server } from "socket.io";

let io: Server;

export const setSocketServer = (socketIo: Server) => {
  io = socketIo;
};

export const notificationService = {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    if (io) {
      io.to(`user:${userId}`).emit("notification", notification);
    }

    return notification;
  },

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async bookingSuccess(userOrId: any, bookingOrId: any, ownerOrId?: any) {
    const userId = typeof userOrId === "object" ? userOrId.id : userOrId;
    const bookingId =
      typeof bookingOrId === "object" ? bookingOrId.id : bookingOrId;
    const ownerId = typeof ownerOrId === "object" ? ownerOrId?.id : ownerOrId;

    // 1. Thông báo cho Khách hàng
    await this.createNotification(
      userId,
      "Thanh toán thành công",
      `Giao dịch cho mã đặt phòng ${bookingId} đã hoàn tất. Chúc bạn một kỳ nghỉ vui vẻ!`,
      "SUCCESS",
    );

    // 2. Thông báo cho Chủ khách sạn (nếu có)
    if (ownerId) {
      await this.createNotification(
        ownerId,
        "Đơn đặt phòng đã được thanh toán",
        `Khách hàng đã thanh toán thành công cho mã đặt phòng ${bookingId}.`,
        "SUCCESS",
      );
    }
  },

  /**
   * Gửi thông báo đến những user đã thêm khách sạn vào Wishlist khi khách sạn có cập nhật
   */
  async notifyHotelUpdateToWishlistUsers(hotelId: string, hotelName: string) {
    const wishlists = await prisma.wishlist.findMany({
      where: { hotelId },
      select: { userId: true },
    });

    if (wishlists.length === 0) return;

    const promises = wishlists.map((w) =>
      this.createNotification(
        w.userId,
        "Khách sạn yêu thích có cập nhật",
        `Khách sạn ${hotelName} bạn đang quan tâm vừa có thay đổi mới (thêm phòng, cập nhật thông tin...). Hãy xem ngay!`,
        "INFO",
      ),
    );

    await Promise.all(promises);
  },
};

// Export rời dành cho trường hợp bạn gọi: import { bookingSuccess } from "..."
export const bookingSuccess =
  notificationService.bookingSuccess.bind(notificationService);
