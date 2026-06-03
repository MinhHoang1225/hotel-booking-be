import { z } from "zod";

export const createHotelDto = z.object({
  body: z.object({
    name: z.string().min(2).max(160),
    description: z.string().max(2000).optional(),
    address: z.string().min(3).max(255),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    images: z.array(z.string().url()).default([])
  })
});

export const updateHotelDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createHotelDto.shape.body.partial()
});

export const approveHotelDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ status: z.enum(["APPROVED", "REJECTED"]) })
});

export const hotelListDto = z.object({
  query: z.object({
    q: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(300).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    sort: z.enum(["price_asc", "price_desc", "rating_desc", "newest"]).default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
  })
});

