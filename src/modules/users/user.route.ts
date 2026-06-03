import { Router } from "express";
import * as controller from "./user.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { userParamsDto, updateUserRoleDto } from "./user.dto";

const router = Router();

router.get("/", authenticate, asyncHandler(controller.listUsers));
router.get(
  "/:id",
  authenticate,
  validate(userParamsDto),
  asyncHandler(controller.getUser),
);
router.patch(
  "/:id/role",
  authenticate,
  validate(updateUserRoleDto),
  asyncHandler(controller.updateUserRole),
);
router.delete(
  "/:id",
  authenticate,
  validate(userParamsDto),
  asyncHandler(controller.deleteUser),
);

export default router;
