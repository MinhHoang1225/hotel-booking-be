import { prisma } from "../../config/prisma";

export const reviewRepository = {
  findById(id) {
    return prisma.review.findUnique({ where: { id } });
  },
  create(data) {
    return prisma.review.create({ data });
  },
  update(id, data) {
    return prisma.review.update({ where: { id }, data });
  },
  delete(id) {
    return prisma.review.delete({ where: { id } });
  },
  listByHotel(hotelId) {
    return prisma.review.findMany({
      where: { hotelId },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" }
    });
  }
};

