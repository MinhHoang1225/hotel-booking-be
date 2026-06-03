import http from "http";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { bookingService  } from "./modules/bookings/booking.service";
import { setSocketServer } from "./modules/notifications/notification.service";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.frontendUrl, credentials: true }
});

io.use((socket, next) => {
  try {
    const headerToken = socket.handshake.headers.authorization?.replace("Bearer ", "");
    const token = socket.handshake.auth?.token || headerToken;
    if (!token) return next(new Error("Authentication required"));

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    socket.data.userId = payload.sub;
    next();
  } catch (_err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.data.userId}`);
  socket.emit("connected", { userId: socket.data.userId });
});

setSocketServer(io);

server.listen(env.port, () => {
  console.log(`Hotel booking API is running on port ${env.port}`);
});

setInterval(() => {
    bookingService.expirePendingBookings().catch(() => {});

}, 60 * 1000);

