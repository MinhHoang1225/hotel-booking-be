import { prisma } from "../../config/prisma";

export const wishlistService = {
  async toggleWishlist(userId: string, hotelId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_hotelId: { userId, hotelId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return { status: "removed" };
    } else {
      await prisma.wishlist.create({ data: { userId, hotelId } });
      return { status: "added" };
    }
  },

  async getMyWishlist(userId: string) {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        hotel: {
          include: {
            rooms: {
              where: { status: "AVAILABLE" },
              select: { price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wishlists.map((w) => {
      const prices = w.hotel.rooms.map((r) => Number(r.price));
      const min_price = prices.length > 0 ? Math.min(...prices) : 0;
      const { rooms, ...rest } = w.hotel;
      return { ...rest, min_price };
    });
  },
};
