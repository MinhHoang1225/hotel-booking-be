import { prisma } from "../../config/prisma";
import { AppError } from "../../common/AppError";
import { bookingSuccess } from "../notifications/notification.service";

async function assertPayableBooking(user, bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, payment: true }
  });

  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.userId !== user.id && user.role !== "ADMIN") throw new AppError(403, "Forbidden");
  if (booking.status !== "PENDING") throw new AppError(400, "Booking is not pending");
  if (booking.expiresAt <= new Date()) throw new AppError(400, "Booking payment time expired");
  return booking;
}

export async function createPayment(user, payload) {
  const booking = await assertPayableBooking(user, payload.bookingId);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: payload.currency,
        status: "SUCCEEDED",
        provider: "mock",
        providerPaymentIntent: `mock_${booking.id}`,
        raw: { mode: "mock" }
      },
      update: {
      amount: booking.totalPrice,
      currency: payload.currency,
      status: "SUCCEEDED",
      provider: "mock",
      providerPaymentIntent: `mock_${booking.id}`,
      raw: { mode: "mock" }
      }
    });

    const confirmed = await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
      include: { user: true, room: { include: { hotel: true } }, payment: true }
    });

    return { payment, booking: confirmed, provider: "mock" };
  });

  await bookingSuccess(result.booking.user, result.booking);
  return result;
}

