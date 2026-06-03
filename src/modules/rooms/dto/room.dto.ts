import { z } from "zod";

export const createRoomDto = z.object({
  body: z.object({
    hotelId: z.string().min(1),
    name: z.string().min(2).max(120),
    description: z.string().max(1500).optional(),
    price: z.coerce.number().positive(),
    capacity: z.coerce.number().int().positive(),
    amenities: z.array(z.string().min(1)).default([]),
    images: z.array(z.string().url()).default([])
  })
});

export const updateRoomDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createRoomDto.shape.body.omit({ hotelId: true }).partial().extend({
    isActive: z.boolean().optional()
  })
});

export const roomParamsDto = z.object({
  params: z.object({ id: z.string().min(1) })
});

