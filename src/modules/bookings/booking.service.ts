import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";
import { notificationService } from "../notifications/notification.service";

export interface CreateBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export const bookingService = {
  /**
   * Tạo Đặt phòng (Sử dụng Transaction chống Double Booking)
   */
  async createBooking(user: any, payload: CreateBookingInput) {
    const userId = user.id;
    const { roomId, guests } = payload;
    const checkInDate = new Date(payload.checkIn);
    const checkOutDate = new Date(payload.checkOut);

    if (checkInDate >= checkOutDate) {
      throw new AppError(400, "Ngày trả phòng phải sau ngày nhận phòng.");
    }

    // Sử dụng Transaction: Bất kỳ lỗi nào xảy ra bên trong sẽ tự động Rollback
    const newBooking = await prisma.$transaction(async (tx) => {
      // 1. RAW QUERY: Khóa dòng (Row Lock) của Room để tránh Race Condition (Nhiều người thao tác cùng lúc)
      const roomArr = await tx.$queryRaw<any[]>`
        SELECT * FROM "Room" 
        WHERE id = ${roomId} AND "status" = 'AVAILABLE' 
        FOR UPDATE
      `;

      if (!roomArr || roomArr.length === 0) {
        throw new AppError(404, "Phòng không tồn tại hoặc đang tạm khóa.");
      }
      const room = roomArr[0];

      // 2. Kiểm tra sức chứa
      if (room.capacity < guests) {
        throw new AppError(
          400,
          `Phòng này chỉ chứa tối đa ${room.capacity} người.`,
        );
      }

      // 3. Logic: Kiểm tra ngày trùng lặp (Overlapping Date)
      const overlappingBookings = await tx.booking.findMany({
        where: {
          roomId,
          status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          NOT: {
            OR: [
              { checkOut: { lte: checkInDate } },
              { checkIn: { gte: checkOutDate } },
            ],
          },
        },
      });

      if (overlappingBookings.length > 0) {
        throw new AppError(
          409,
          "Phòng đã có người đặt trong khoảng thời gian này.",
        );
      }

      // 4. Tính toán giá tiền và lưu Booking (Cho phép 15 phút thanh toán)
      const days = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24),
      );
      const totalPrice = Number(room.price) * days;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      return await tx.booking.create({
        data: {
          userId,
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          totalPrice,
          status: "PENDING",
          expiresAt,
        },
      });
    });

    // Lấy thông tin phòng và khách sạn để biết ai là chủ khách sạn
    const roomDetails = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    // --- THÊM NOTIFICATION SAU KHI TẠO BOOKING THÀNH CÔNG ---
    // 1. Thông báo cho User
    await notificationService.createNotification(
      userId,
      "Đặt phòng thành công",
      `Mã đặt phòng của bạn đã được khởi tạo. Vui lòng thanh toán trước khi hết hạn.`,
      "SUCCESS",
    );

    // 2. Thông báo cho Hotel Owner
    if (roomDetails?.hotel?.ownerId) {
      await notificationService.createNotification(
        roomDetails.hotel.ownerId,
        "Có đơn đặt phòng mới",
        `Bạn vừa nhận được một đơn đặt phòng mới cho phòng ${roomDetails.name}.`,
        "INFO",
      );
    }

    return newBooking;
  },

  /**
   * Kiểm tra phòng trống
   */
  async checkAvailability(roomId: any, checkIn: any, checkOut: any) {
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    const overlapping = await prisma.booking.findMany({
      where: {
        roomId: String(roomId),
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
        NOT: {
          OR: [
            { checkOut: { lte: checkInDate } },
            { checkIn: { gte: checkOutDate } },
          ],
        },
      },
    });

    return { available: overlapping.length === 0 };
  },

  /**
   * Lấy chi tiết booking
   */
  async getBooking(user: any, id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: { include: { hotel: true } } },
    });

    if (!booking) throw new AppError(404, "Không tìm thấy booking");

    // Phân quyền: USER chỉ được xem của mình, OWNER chỉ được xem của khách sạn mình
    if (user.role === "USER" && booking.userId !== user.id) {
      throw new AppError(403, "Bạn không có quyền truy cập booking này");
    }
    if (user.role === "HOTEL_OWNER" && booking.room.hotel.ownerId !== user.id) {
      throw new AppError(403, "Bạn không có quyền truy cập booking này");
    }

    return booking;
  },

  /**
   * Lấy danh sách booking (Hỗ trợ theo Role)
   */
  async listBookings(user: any, query: any = {}) {
    // Nếu truyền type=mine, bắt buộc chỉ lấy những chuyến đi do chính tài khoản này đi du lịch
    if (query.type === "mine" || user.role === "USER") {
      return prisma.booking.findMany({
        where: { userId: user.id },
        include: { room: { include: { hotel: true } }, review: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (user.role === "HOTEL_OWNER") {
      return prisma.booking.findMany({
        where: { room: { hotel: { ownerId: user.id } } },
        include: {
          room: { include: { hotel: true } },
          user: { select: { fullName: true, email: true } },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "ADMIN") {
      return prisma.booking.findMany({
        include: {
          room: { include: { hotel: true } },
          user: { select: { fullName: true, email: true } },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return [];
  },

  /**
   * Hủy booking
   */
  async cancelBooking(user: any, id: string, reason?: string) {
    // Tận dụng hàm getBooking để check quyền truy cập (OWNER và USER)
    const booking = await this.getBooking(user, id);

    if (booking.status === "CANCELLED") {
      throw new AppError(400, "Booking này đã bị hủy từ trước.");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Thông báo cho User khi bị hủy
    await notificationService.createNotification(
      updatedBooking.userId,
      "Đơn đặt phòng đã bị hủy",
      `Đơn đặt phòng của bạn đã bị hủy. ${reason ? `Lý do: ${reason}` : ""}`,
      "WARNING",
    );

    return updatedBooking;
  },

  /**
   * Tự động hủy các booking hết hạn thanh toán (Job quét định kỳ)
   */
  async expirePendingBookings() {
    const result = await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: { lte: new Date() },
      },
      data: { status: "CANCELLED" },
    });
    return { expiredCount: result.count };
  },
};
