# NF Signature Salon — Expected API Contracts

This document lists the backend endpoints the client is prepared to consume.
They are **not implemented in this repository** — they belong to the separate
`salonbook-server` project. The client calls them through
`src/services/api/*` and is fully mockable with `VITE_USE_MOCK_DATA`.

**Base URL:** `VITE_API_BASE_URL` (example: `http://localhost:5000/api`)

**Common conventions**

- JSON request and response bodies (`Content-Type: application/json`).
- Authenticated requests send `Authorization: Bearer <token>`.
- Errors should use a non-2xx status and a body such as
  `{ "message": "Human readable reason" }` (`error` and `detail` are also read).
- A `401` response clears the client session automatically.
- CORS must allow the client origin.
- Roles (`customer`, `admin`) are enforced **on the server**, not only in the UI.

---

## 1. Authentication

Authentication is **never mocked** on the client.

### `POST /auth/register`

```jsonc
// request
{ "name": "Jane Doe", "email": "jane@example.com", "phone": "+880...", "password": "..." }

// response 201
{ "token": "<jwt>", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "phone": "+880...", "role": "customer" } }
```

The client also accepts a response without `token`; it then immediately calls
`POST /auth/login` to obtain a session.

### `POST /auth/login`

```jsonc
// request
{ "email": "jane@example.com", "password": "..." }

// response 200
{ "token": "<jwt>", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" } }
```

### `GET /auth/me`

```jsonc
// response 200
{ "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" } }
```

Used on first load to validate a stored token. A bare user object is also accepted.

### `POST /auth/logout`

Returns any 2xx status. The client clears its local session regardless.

---

## 2. Service catalogue

### `GET /services`

Query: `search` (string), `category` (`hair|skin|nails|wellness`),
`sort` (`price-asc|price-desc`).

```jsonc
// response 200 — an array, or { "data" | "services" | "items": [...] }
[
  {
    "id": "s1",
    "title": "Men's Haircut",
    "description": "A precision haircut tailored to your style.",
    "longDescription": "Optional longer copy.",
    "price": "$35",
    "duration": "45 min",
    "category": "hair",
    "image": "/services/mens-haircut.jpg",
    "featured": true,
    "includes": ["Consultation", "Precision cut"],
    "goodToKnow": ["Allow 45–60 minutes"]
  }
]
```

### `GET /services/:id`

Same service shape. `404` when the service does not exist.

---

## 3. Availability

### `GET /appointments/availability`

Query: `serviceId`, `date` (`YYYY-MM-DD`), `location` (display address).

```jsonc
// response 200 — one of:
{ "availableSlots": ["10:00 AM", "11:30 AM"] }
{ "slots": ["10:00 AM"] }
{ "data": { "availableSlots": ["10:00 AM"] } }
["10:00 AM"]
[{ "time": "10:00 AM" }]
```

**The server is the only source of truth for slots.** It must enforce opening
days, holidays, staff schedules, service duration and existing reservations.
The client never generates time slots. Before the endpoint exists, a `404`/`501`
is surfaced to the user as “live availability is not configured”.

---

## 4. Appointments (booking)

### `POST /appointments`

Authenticated when the user is signed in; the API may also accept guest details.

```jsonc
// request
{
  "serviceId": "s1",
  "serviceTitle": "Men's Haircut",
  "date": "2026-12-01",
  "time": "10:00 AM",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+880...",
  "notes": "Optional",
  "price": "$35",
  "duration": "45 min"
}

// response 201 — an appointment, or { "appointment" | "data": {...} }
{
  "id": "a1",
  "serviceId": "s1",
  "serviceTitle": "Men's Haircut",
  "date": "2026-12-01",
  "time": "10:00 AM",
  "duration": "45 min",
  "price": "$35",
  "status": "pending",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com"
}
```

`status` is one of `pending | confirmed | completed | cancelled`.

The server must **re-validate the slot** before creating the appointment and
return `409` if it was taken meanwhile.

---

## 5. Customer account

All require authentication and a `customer` (or `admin`) role.

### `GET /customers/me/dashboard`

```jsonc
{
  "stats": { "upcoming": 2, "completed": 4, "visits": 6, "favouriteCategory": "hair" },
  "nextAppointment": { /* appointment or null */ },
  "recentAppointments": [ /* appointments */ ]
}
```

### `GET /customers/me/appointments`

An array of appointments, or `{ "data" | "appointments": [...] }`.

### `PATCH /customers/me`

```jsonc
// request
{ "name": "Jane Doe", "email": "jane@example.com", "phone": "+880..." }

// response 200 — updated user, or { "user" | "data": {...} }
```

---

## 6. Admin

All require an `admin` role.

### `GET /admin/dashboard`

```jsonc
{
  "stats": { "todayBookings": 8, "pendingBookings": 3, "activeServices": 20, "totalCustomers": 128 },
  "recentBookings": [ /* appointments */ ],
  "servicesByCategory": { "hair": 11, "skin": 6, "nails": 2, "wellness": 1 }
}
```

### `GET /admin/bookings`

An array of appointments, or `{ "data" | "bookings": [...] }`.

### `PATCH /admin/bookings/:id/status`

```jsonc
// request
{ "status": "confirmed" }

// response 200 — updated appointment, or { "booking" | "data": {...} }
```

### `GET /admin/customers`

An array of customers, or `{ "data" | "customers": [...] }`.

```jsonc
{
  "id": "c1",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+880...",
  "visits": 12,
  "lastVisit": "2026-11-01",
  "joinedAt": "2025-10-01"
}
```

---

## 7. Contact

### `POST /contact`

```jsonc
// request
{ "name": "Jane Doe", "email": "jane@example.com", "message": "..." }

// response 200 — delivery must be explicitly confirmed
{ "success": true }
```

The client only shows a success message when the response contains
`success: true`; otherwise it reports that delivery could not be confirmed.

---

## Client-side status expectations

| Status | Client behaviour |
| --- | --- |
| `401` | Clear session, emit global unauthorized event, ask user to sign in again. |
| `403` | Show “You do not have permission to do that.” |
| `404` | Show a not-found / empty state (e.g. service or availability). |
| `409` | Show a conflict message (e.g. slot already booked). |
| `422` | Show “Please check the highlighted fields.” |
| `429` | Show a rate-limit message. |
| `5xx` | Show “The server is unavailable right now.” |

See `src/services/api/client.ts` and `src/utils/errors.ts` for the exact mapping.
