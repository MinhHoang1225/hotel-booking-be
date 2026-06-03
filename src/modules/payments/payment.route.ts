import { Router } from "express";
import * as controller from "./payment.controller";
import { asyncHandler } from "../../common/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createPaymentDto } from "./dto/payment.dto";

const router = Router();

router.post("/", authenticate, validate(createPaymentDto), asyncHandler(controller.createPayment));

export default router;

