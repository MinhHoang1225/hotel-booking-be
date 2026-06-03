import { Router } from "express";
import * as controller from "./auth.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { registerDto, loginDto, googleLoginDto } from "./dto/auth.dto";

const router = Router();

router.post(
  "/register",
  validate(registerDto),
  asyncHandler(controller.register),
);
router.post("/login", validate(loginDto), asyncHandler(controller.login));
router.post(
  "/google",
  validate(googleLoginDto),
  asyncHandler(controller.loginGoogle),
);
router.post("/logout", authenticate, asyncHandler(controller.logout));
router.get("/me", authenticate, asyncHandler(controller.me));
router.patch("/me", authenticate, asyncHandler(controller.updateProfile));

export default router;
