import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";
import { uploadMultipleImages } from "../../config/cloudinary";
import { notificationService } from "../notifications/notification.service";

export interface CreateHotelInput {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  images?: string[];
}

export interface SearchHotelParams {
  lat: number;
  lng: number;
  radiusInKm: number;
  limit?: number;
  offset?: number;
}

export const hotelService = {
  async createHotel(ownerId: string, payload: CreateHotelInput) {
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user || user.role !== "HOTEL_OWNER") {
      throw new AppError(403, "Chỉ chủ khách sạn mới có quyền tạo khách sạn.");
    }

    const uploadedImages = await uploadMultipleImages(payload.images || []);

    const hotel = await prisma.hotel.create({
      data: {
        ownerId,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        images: uploadedImages,
        status: "PENDING",
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await notificationService.createNotification(
        admin.id,
        "Khách sạn mới cần duyệt",
        `Chủ khách sạn ${user.fullName} vừa đăng ký khách sạn "${hotel.name}". Vui lòng kiểm duyệt.`,
        "INFO",
      );
    }

    return hotel;
  },

  async searchNearbyHotels(params: SearchHotelParams) {
    const { lat, lng, radiusInKm, limit = 10, offset = 0 } = params;

    const nearbyHotels = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        name, 
        address, 
        images,
        latitude, 
        longitude,
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) AS distance
      FROM "Hotel"
      WHERE "status" = 'APPROVED'
      HAVING (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians(latitude))
          )
        ) <= ${radiusInKm}
      ORDER BY distance ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return nearbyHotels;
  },

  async listHotels(query: any = {}) {
    const {
      q,
      minPrice,
      maxPrice,
      capacity,
      checkIn,
      checkOut,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const checkInDate = checkIn ? new Date(checkIn as string) : null;
    const checkOutDate = checkOut ? new Date(checkOut as string) : null;

    const where: Prisma.HotelWhereInput = {
      status: "APPROVED",
    };

    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { address: { contains: String(q), mode: "insensitive" } },
      ];
    }

    const roomFilter: Prisma.RoomWhereInput = { status: "AVAILABLE" };
    let hasRoomFilter = false;

    if (minPrice || maxPrice) {
      roomFilter.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
      hasRoomFilter = true;
    }

    if (capacity) {
      roomFilter.capacity = { gte: Number(capacity) };
      hasRoomFilter = true;
    }

    if (checkInDate && checkOutDate) {
      roomFilter.bookings = {
        none: {
          status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      };
      hasRoomFilter = true;
    }

    if (hasRoomFilter) {
      where.rooms = { some: roomFilter };
    }

    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          rooms: {
            where: roomFilter,
            select: { price: true },
          },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    const formattedData = data.map((hotel) => {
      const prices = hotel.rooms.map((r) => Number(r.price));
      const min_price = prices.length > 0 ? Math.min(...prices) : 0;
      const { rooms, ...rest } = hotel;
      return { ...rest, min_price };
    });

    return {
      data: formattedData,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  },

  async getHotelById(id: string) {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!hotel) {
      throw new AppError(404, "Không tìm thấy khách sạn");
    }

    const rooms = await prisma.room.findMany({
      where: { hotelId: id, status: "AVAILABLE" },
      select: { price: true },
    });
    const prices = rooms.map((r) => Number(r.price));
    const min_price = prices.length > 0 ? Math.min(...prices) : 0;

    const reviews = await prisma.review.aggregate({
      where: { hotelId: id },
      _avg: { rating: true },
    });

    return { ...hotel, min_price, avgRating: reviews._avg.rating || 0 };
  },

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

  async listHotelReviews(hotelId: string) {
    return prisma.review.findMany({
      where: { hotelId },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async myHotels(user: any, query: any = {}) {
    const { status } = query;
    if (user.role !== "HOTEL_OWNER" && user.role !== "ADMIN") {
      throw new AppError(403, "Bạn không có quyền truy cập");
    }

    const where: Prisma.HotelWhereInput = {};
    if (user.role === "HOTEL_OWNER") {
      where.ownerId = user.id;
    }
    if (status) {
      const statusArray = String(status).split(",");
      if (statusArray.length > 1) {
        where.status = { in: statusArray as any[] };
      } else {
        where.status = status as any;
      }
    }

    return prisma.hotel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async updateHotel(user: any, id: string, payload: any) {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new AppError(404, "Không tìm thấy khách sạn");

    if (user.role !== "ADMIN" && hotel.ownerId !== user.id) {
      throw new AppError(403, "Bạn không có quyền chỉnh sửa khách sạn này");
    }

    let updatedImages = payload.images;
    if (payload.images && Array.isArray(payload.images)) {
      updatedImages = await uploadMultipleImages(payload.images);
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: { ...payload, ...(updatedImages ? { images: updatedImages } : {}) },
    });

    // Gửi thông báo cho người dùng đã thêm khách sạn vào Wishlist
    await notificationService.notifyHotelUpdateToWishlistUsers(
      updatedHotel.id,
      updatedHotel.name,
    );

    return updatedHotel;
  },

  async deleteHotel(user: any, id: string) {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new AppError(404, "Không tìm thấy khách sạn");

    if (user.role !== "ADMIN" && hotel.ownerId !== user.id) {
      throw new AppError(403, "Bạn không có quyền xóa khách sạn này");
    }

    return prisma.hotel.delete({ where: { id } });
  },

  async approveHotel(id: string, status: string) {
    const hotel = await prisma.hotel.update({
      where: { id },
      data: { status: status as any },
    });

    const statusText =
      status === "APPROVED"
        ? "đã được phê duyệt và đang hoạt động"
        : "đã bị hệ thống từ chối";
    const notifType = status === "APPROVED" ? "SUCCESS" : "ERROR";
    await notificationService.createNotification(
      hotel.ownerId,
      "Kết quả kiểm duyệt khách sạn",
      `Khách sạn "${hotel.name}" của bạn ${statusText}.`,
      notifType,
    );

    return hotel;
  },

  async uploadHotelImages(user: any, id: string, files: any) {
    throw new AppError(501, "Chức năng upload ảnh đang được xây dựng.");
  },
};
