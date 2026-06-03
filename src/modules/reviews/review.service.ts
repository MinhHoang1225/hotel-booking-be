import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";
import { reviewRepository } from "./review.repository";
import { notificationService } from "../notifications/notification.service";

export async function createReview(user, payload) {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { room: { include: { hotel: true } }, review: true },
  });

  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.userId !== user.id) throw new AppError(403, "Forbidden");

  // Chủ khách sạn không được tự đánh giá khách sạn của mình
  if (user.role === "HOTEL_OWNER" && booking.room.hotel.ownerId === user.id) {
    throw new AppError(403, "Bạn không thể tự đánh giá khách sạn của mình.");
  }

  if (booking.status === "PENDING" || booking.status === "CANCELLED")
    throw new AppError(400, "Chỉ những booking đã xác nhận mới được đánh giá");
  if (booking.review) throw new AppError(409, "Booking already reviewed");

  const review = await reviewRepository.create({
    userId: user.id,
    bookingId: booking.id,
    hotelId: booking.room.hotelId,
    rating: payload.rating,
    comment: payload.comment,
  });

  // Gửi thông báo cho Chủ khách sạn
  if (booking.room.hotel.ownerId) {
    await notificationService.createNotification(
      booking.room.hotel.ownerId,
      "Có đánh giá mới",
      `Khách sạn ${booking.room.hotel.name} vừa nhận được đánh giá ${payload.rating} sao từ khách hàng.`,
      "INFO",
    );
  }

  return review;
}

export async function updateReview(user, id, payload) {
  const review = await reviewRepository.findById(id);
  if (!review) throw new AppError(404, "Review not found");
  if (review.userId !== user.id && user.role !== "ADMIN")
    throw new AppError(403, "Forbidden");
  return reviewRepository.update(id, payload);
}

export async function deleteReview(user, id) {
  const review = await reviewRepository.findById(id);
  if (!review) throw new AppError(404, "Review not found");
  if (review.userId !== user.id && user.role !== "ADMIN")
    throw new AppError(403, "Forbidden");
  await reviewRepository.delete(id);
  return { deleted: true };
}

export async function listByHotel(hotelId) {
  return reviewRepository.listByHotel(hotelId);
}

export async function replyToReview(user, reviewId, replyText) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { hotel: true },
  });

  if (!review) throw new AppError(404, "Không tìm thấy đánh giá.");

  // Defensive check: Đảm bảo review có liên kết đến khách sạn
  // Lỗi này có thể xảy ra nếu dữ liệu trong DB không nhất quán (vd: khách sạn đã bị xóa)
  if (!review.hotel) {
    console.error(
      `[Data Integrity Error]: Review ID ${reviewId} is orphaned and does not have an associated hotel.`,
    );
    throw new AppError(
      500,
      "Dữ liệu đánh giá bị lỗi, không tìm thấy khách sạn liên quan.",
    );
  }

  // Kiểm tra xem người dùng có phải chủ của khách sạn được đánh giá không
  if (review.hotel.ownerId !== user.id) {
    throw new AppError(403, "Bạn không có quyền phản hồi đánh giá này.");
  }

  const updatedReview = await reviewRepository.update(reviewId, {
    reply: replyText,
  });

  // Thông báo cho Khách hàng (User)
  await notificationService.createNotification(
    review.userId,
    "Phản hồi đánh giá mới",
    `Chủ khách sạn ${review.hotel.name} vừa trả lời đánh giá của bạn.`,
    "INFO",
  );

  return updatedReview;
}

export async function listMyHotelReviews(ownerId: string) {
  return prisma.review.findMany({
    where: {
      hotel: {
        ownerId: ownerId,
      },
    },
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
      hotel: { select: { name: true } },
      booking: { include: { room: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
