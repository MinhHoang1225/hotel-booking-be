# 🏨 Hotel Booking System - Backend API

Node.js + Express + TypeScript backend API for the Hotel Booking System. Built with Prisma ORM and PostgreSQL, providing high performance, security, and robust handling of complex business logic such as preventing double bookings (Race Conditions).

## ✨ Key Features

- **Secure Booking Process (Concurrency Control):** Uses Database Transactions and Row-level Locks (`FOR UPDATE`) to prevent race conditions and ensure double booking does not occur when multiple users book simultaneously.
- **Automated Jobs:** Automatically cancels pending bookings that exceed the payment time limit.
- **Role-Based Access Control (RBAC):** 3 Main Roles:
  - `ADMIN`: Manages the entire system, users, and approves/rejects hotels.
  - `HOTEL_OWNER`: Adds/edits/deletes hotels and rooms, manages bookings, and replies to reviews.
  - `USER`: Searches, views details, books rooms, and leaves reviews.
- **Authentication & Authorization:** Secured with JWT, supports Google OAuth login (Google Client ID).
- **Cloudinary Integration:** Uploads and manages hotel/room images directly in the cloud.
- **Realtime Notifications:** Emits real-time notifications (via Socket.IO) on successful bookings, new reservations, or canceled bookings.

## 🚀 Tech Stack

- **Runtime/Framework:** Node.js, Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching:** Redis
- **Cloud Storage:** Cloudinary
- **Security:** JWT (JSON Web Token)

## 🛠 Requirements

- Node.js (v16+ or v18+)
- PostgreSQL
- Redis

## ⚙️ Installation & Setup

**1. Clone the project and install dependencies**

```bash
cd hotel-booking-be
npm install
```

**2. Configure environment variables**
Create a `.env` file from the `.env.example` file and fill in your information:

```bash
cp .env.example .env
```

_Crucial configurations in `.env`:_

```dotenv
PORT=4000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hotel_booking?schema=public"
JWT_SECRET="your-secret-key"
REDIS_URL="..."
CLOUDINARY_CLOUD_NAME="..."
```

**3. Database Setup (Prisma)**
Run the following command to sync the schema with the database:

```bash
npx prisma generate
npx prisma db push
# or npx prisma migrate dev (depending on your workflow)
```

**4. Start the server**

```bash
# Run in development mode
npm run dev

# Run in production mode
npm run build
npm start
```

API base URL: `http://localhost:4000/api/v1`
Socket.IO URL: `http://localhost:4000`

## 🔔 Realtime Notification

The Frontend connects using a JWT via Socket.IO:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: { token: accessToken },
});

socket.on("connected", (payload) => {
  console.log("socket connected", payload);
});

socket.on("notification", (notification) => {
  console.log("new notification", notification);
});
```

Events currently emitted:

- `BOOKING_CONFIRMED`
- `BOOKING_CANCELLED`

## 🛡️ Booking Protection (Concurrency)

Booking creation uses a database transaction and locks the room row to prevent overlapping schedules:

```sql
SELECT ... FROM "Room" WHERE id = $1 FOR UPDATE
```

Then it checks for overlapping bookings:

```sql
NOT ("checkOut" <= new_check_in OR "checkIn" >= new_check_out)
```

Only `CONFIRMED` bookings and unexpired `PENDING` bookings block room availability.

## 📁 Project Structure

```text
src/
  modules/
    auth/
    bookings/
    hotels/
    notifications/
    rooms/
    users/
      dto/
      *.service.ts
      *.controller.ts
      *.route.ts
  config/
    prisma.ts
```

---

_Developed by the Hotel Booking Project Team._
