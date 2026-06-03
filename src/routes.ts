import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import hotelRoutes from "./modules/hotels/hotel.route";
import roomRoutes from "./modules/rooms/room.route";
import bookingRoutes from "./modules/bookings/booking.route";
import paymentRoutes from "./modules/payments/payment.route";
import reviewRoutes from "./modules/reviews/review.route";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import userRoutes from "./modules/users/user.route";
import notificationRoutes from "./modules/notifications/notification.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/hotels", hotelRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);

export default router;

