import { Router } from "express";
import * as controller from "./dashboard.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/owner", authenticate, authorize("HOTEL_OWNER", "ADMIN"), asyncHandler(controller.ownerDashboard));
router.get("/admin", authenticate, authorize("ADMIN"), asyncHandler(controller.adminDashboard));

export default router;

