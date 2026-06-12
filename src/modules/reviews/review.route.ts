import { Router } from "express";
import * as reviewController from "./review.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes, no auth needed
router.get("/top", reviewController.listTopReviews);
router.get("/hotel/:hotelId", reviewController.listByHotel);

// Protected routes for Hotel Owners
router.get(
  "/mine",
  authenticate,
  authorize("HOTEL_OWNER"),
  reviewController.listMyHotelReviews,
);
router.patch(
  "/:id/reply",
  authenticate,
  authorize("HOTEL_OWNER"),
  reviewController.replyToReview,
);

// Protected routes for Users
router.post(
  "/",
  authenticate,
  authorize("USER"),
  reviewController.createReview,
);
router.patch("/:id", authenticate, reviewController.updateReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

export default router;
