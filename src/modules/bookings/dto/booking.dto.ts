import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createBookingDto = z.object({
  body: z.object({
    roomId: z.string().min(1),
    checkIn: dateString,
    checkOut: dateString,
    guests: z.coerce.number().int().positive()
  })
});

export const availabilityDto = z.object({
  query: z.object({
    roomId: z.string().min(1),
    checkIn: dateString,
    checkOut: dateString
  })
});

export const bookingParamsDto = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const cancelBookingDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    reason: z.string().max(500).optional()
  })
});

