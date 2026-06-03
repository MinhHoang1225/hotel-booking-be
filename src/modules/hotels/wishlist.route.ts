import { Router } from "express";
import * as controller from "./wishlist.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/toggle", authenticate, asyncHandler(controller.toggleWishlist));
router.get("/", authenticate, asyncHandler(controller.getMyWishlist));

export default router;
