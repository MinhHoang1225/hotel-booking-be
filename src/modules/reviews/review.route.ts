import { Router } from "express";
import { z } from "zod";
import * as controller from "./review.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  createReviewDto,
  updateReviewDto,
  replyReviewDto,
} from "./dto/review.dto";

const router = Router();

router.get(
  "/hotel/:hotelId",
  validate(z.object({ params: z.object({ hotelId: z.string().min(1) }) })),
  asyncHandler(controller.listByHotel),
);
router.get(
  "/my-hotels",
  authenticate,
  authorize("HOTEL_OWNER"),
  asyncHandler(controller.listMyHotelReviews),
);
router.post(
  "/",
  authenticate,
  validate(createReviewDto),
  asyncHandler(controller.createReview),
);
router.patch(
  "/:id",
  authenticate,
  validate(updateReviewDto),
  asyncHandler(controller.updateReview),
);
router.patch(
  "/:id/reply",
  authenticate,
  authorize("HOTEL_OWNER"),
  validate(replyReviewDto),
  asyncHandler(controller.replyToReview),
);
router.delete(
  "/:id",
  authenticate,
  validate(z.object({ params: z.object({ id: z.string().min(1) }) })),
  asyncHandler(controller.deleteReview),
);

export default router;
