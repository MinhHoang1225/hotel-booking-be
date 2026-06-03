import { Router } from "express";
import * as controller from "./notification.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, asyncHandler(controller.getMyNotifications));
router.patch("/:id/read", authenticate, asyncHandler(controller.markAsRead));

export default router;
