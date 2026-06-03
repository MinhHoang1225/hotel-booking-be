import { Router } from "express";
import * as controller from "./booking.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  createBookingDto,
  availabilityDto,
  bookingParamsDto,
  cancelBookingDto
} from "./dto/booking.dto";

const router = Router();

router.get("/availability", validate(availabilityDto), asyncHandler(controller.checkAvailability));
router.get("/", authenticate, asyncHandler(controller.listBookings));
router.get("/:id", authenticate, validate(bookingParamsDto), asyncHandler(controller.getBooking));
router.post("/", authenticate, authorize("USER"), validate(createBookingDto), asyncHandler(controller.createBooking));
router.patch("/:id/cancel", authenticate, validate(cancelBookingDto), asyncHandler(controller.cancelBooking));
router.post("/expire-pending", authenticate, authorize("ADMIN"), asyncHandler(controller.expirePendingBookings));

export default router;

