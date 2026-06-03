# Hotel Booking Backend

Node.js + Express + TypeScript backend, organized by module:

```text
module/
  dto/
  *.service.ts
  *.controller.ts
  *.route.ts
  *.repository.ts
```

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

API base URL:

```text
http://localhost:4000/api/v1
```

Socket.IO URL:

```text
http://localhost:4000
```

## Features

- Auth: register, login, Google OAuth, JWT, RBAC.
- Hotels: CRUD, approve/reject, upload images.
- Rooms: CRUD with hotel ownership check.
- Bookings: availability, pending booking, cancel, auto-expire pending.
- Payments: fake payment only. `POST /payments` confirms the booking immediately.
- Notifications: realtime Socket.IO notification events. No email.
- Reviews: only users with confirmed completed booking can review.
- Dashboard: owner/admin statistics.

## Realtime Notification

Frontend connects with JWT:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: { token: accessToken }
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

## Booking Protection

Booking creation uses a database transaction and locks the room row:

```sql
SELECT ... FROM "Room" WHERE id = $1 FOR UPDATE
```

Then it checks overlapping bookings:

```sql
NOT ("checkOut" <= new_check_in OR "checkIn" >= new_check_out)
```

Only `CONFIRMED` bookings and unexpired `PENDING` bookings block availability.
