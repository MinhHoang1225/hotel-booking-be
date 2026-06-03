import { prisma } from "../../config/prisma";

export async function ownerDashboard(user) {
  const [bookingCount, revenue, hotels, pendingBookings] = await Promise.all([
    prisma.booking.count({ where: { room: { hotel: { ownerId: user.id } } } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", room: { hotel: { ownerId: user.id } } },
      _sum: { totalPrice: true }
    }),
    prisma.hotel.count({ where: { ownerId: user.id } }),
    prisma.booking.count({
      where: { status: "PENDING", room: { hotel: { ownerId: user.id } } }
    })
  ]);

  return {
    hotels,
    bookings: bookingCount,
    pendingBookings,
    revenue: Number(revenue._sum.totalPrice || 0)
  };
}

export async function adminDashboard() {
  const [users, hotels, pendingHotels, bookings, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.hotel.count(),
    prisma.hotel.count({ where: { status: "PENDING" } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalPrice: true } })
  ]);

  return {
    users,
    hotels,
    pendingHotels,
    bookings,
    revenue: Number(revenue._sum.totalPrice || 0)
  };
}

