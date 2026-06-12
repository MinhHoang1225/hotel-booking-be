import { Router } from "express";
import { z } from "zod";
import * as controller from "./room.controller";
import { compareRoomsController } from "./room.compare.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createRoomDto, updateRoomDto, roomParamsDto } from "./dto/room.dto";

const router = Router();

// Đặt route /compare lên trước /:id để tránh bị nhầm lẫn tham số
router.get("/compare", asyncHandler(compareRoomsController));

router.get(
  "/hotel/:hotelId",
  validate(z.object({ params: z.object({ hotelId: z.string().min(1) }) })),
  asyncHandler(controller.listHotelRooms),
);
router.get("/:id", validate(roomParamsDto), asyncHandler(controller.getRoom));
router.post(
  "/",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  validate(createRoomDto),
  asyncHandler(controller.createRoom),
);
router.patch(
  "/:id",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  validate(updateRoomDto),
  asyncHandler(controller.updateRoom),
);
router.delete(
  "/:id",
  authenticate,
  authorize("HOTEL_OWNER", "ADMIN"),
  validate(roomParamsDto),
  asyncHandler(controller.deleteRoom),
);

export default router;
