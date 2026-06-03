import { z } from "zod";

export const createPaymentDto = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    currency: z.string().min(3).max(3).default("usd")
  })
});

export const paymentParamsDto = z.object({
  params: z.object({ bookingId: z.string().min(1) })
});

