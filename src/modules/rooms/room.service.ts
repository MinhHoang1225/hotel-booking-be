import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";
import { uploadMultipleImages } from "../../config/cloudinary";
import { notificationService } from "../notifications/notification.service";

export interface CreateRoomInput {
  hotelId: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  amenities: string[];
  images?: string[];
}

export const roomService = {
  async createRoom(user: any, payload: CreateRoomInput) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: payload.hotelId },
    });
    if (!hotel) throw new AppError(404, "Không tìm thấy khách sạn.");

    if (user.role !== "ADMIN" && hotel.ownerId !== user.id) {
      throw new AppError(
        403,
        "Bạn không có quyền thêm phòng cho khách sạn này.",
      );
    }

    const uploadedImages = await uploadMultipleImages(payload.images || []);

    const newRoom = await prisma.room.create({
      data: { ...payload, images: uploadedImages, status: "AVAILABLE" },
    });

    // Gửi thông báo cho người dùng đã thêm khách sạn vào Wishlist
    await notificationService.notifyHotelUpdateToWishlistUsers(
      hotel.id,
      hotel.name,
    );

    return newRoom;
  },

  async deleteRoom(user: any, roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });
    if (!room) throw new AppError(404, "Không tìm thấy phòng.");

    if (user.role !== "ADMIN" && room.hotel.ownerId !== user.id) {
      throw new AppError(403, "Bạn không có quyền xóa phòng này.");
    }

    return await prisma.room.delete({
      where: { id: roomId },
    });
  },

  /**
   * Lấy danh sách phòng theo ID khách sạn
   */
  async listHotelRooms(hotelId: string, checkIn?: string, checkOut?: string) {
    const where: Prisma.RoomWhereInput = {
      hotelId,
      status: "AVAILABLE",
    };

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const rooms = await prisma.room.findMany({
        where,
        include: {
          bookings: {
            where: {
              status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
            select: { id: true },
          },
        },
        orderBy: { price: "asc" },
      });

      return rooms.map((room) => {
        const isBooked = room.bookings.length > 0;
        const { bookings, ...rest } = room;
        return { ...rest, isBooked };
      });
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { price: "asc" },
    });

    return rooms.map((room) => ({ ...room, isBooked: false }));
  },

  async getRoom(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId, status: "AVAILABLE" },
      include: { hotel: true },
    });
    if (!room) throw new AppError(404, "Không tìm thấy phòng.");
    return room;
  },

  async updateRoom(user: any, roomId: string, payload: any) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });
    if (!room) throw new AppError(404, "Không tìm thấy phòng.");
    if (user.role !== "ADMIN" && room.hotel.ownerId !== user.id)
      throw new AppError(403, "Bạn không có quyền sửa phòng này.");

    let updatedImages = payload.images;
    if (payload.images && Array.isArray(payload.images)) {
      updatedImages = await uploadMultipleImages(payload.images);
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { ...payload, ...(updatedImages ? { images: updatedImages } : {}) },
    });

    // Gửi thông báo cho người dùng đã thêm khách sạn vào Wishlist
    await notificationService.notifyHotelUpdateToWishlistUsers(
      room.hotel.id,
      room.hotel.name,
    );

    return updatedRoom;
  },
};
