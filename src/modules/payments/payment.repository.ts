import { prisma } from "../../config/prisma";

export const paymentRepository = {
  upsertForBooking(bookingId, data) {
    return prisma.payment.upsert({
      where: { bookingId },
      create: { bookingId, ...data },
      update: data
    });
  },
  findByProviderIntent(providerPaymentIntent) {
    return prisma.payment.findUnique({
      where: { providerPaymentIntent },
      include: { booking: { include: { user: true } } }
    });
  }
};

