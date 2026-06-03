import { z } from "zod";

export const createReviewDto = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1500).optional()
  })
});

export const updateReviewDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(1500).optional()
  })
});

export const replyReviewDto = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    reply: z.string().max(1500)
  })
});

