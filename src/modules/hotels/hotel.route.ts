import { Router } from "express";
import * as controller from "./hotel.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import {
  createHotelDto,
  updateHotelDto,
  approveHotelDto,
  hotelListDto,
} from "./dto/hotel.dto";
import wishlistRoutes from "./wishlist.route";

const router = Router();

router.get("/", validate(hotelListDto), asyncHandler(controller.listHotels));
router.get(
  "/mine",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  asyncHandler(controller.myHotels),
);

// Nhúng router của wishlist vào trong hotels. Endpoint sẽ trở thành: /hotels/wishlists/...
router.use("/wishlists", wishlistRoutes);

router.get("/:id", asyncHandler(controller.getHotel));
router.post(
  "/",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  validate(createHotelDto),
  asyncHandler(controller.createHotel),
);
router.post(
  "/:id/images",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  upload.array("images", 10),
  asyncHandler(controller.uploadHotelImages),
);
router.patch(
  "/:id",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  validate(updateHotelDto),
  asyncHandler(controller.updateHotel),
);
router.delete(
  "/:id",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  asyncHandler(controller.deleteHotel),
);
router.patch(
  "/:id/approval",
  authenticate,
  authorize("ADMIN"),
  validate(approveHotelDto),
  asyncHandler(controller.approveHotel),
);

export default router;
