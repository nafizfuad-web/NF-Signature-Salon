# NF Signature Salon — Client (Frontend)

A premium, responsive salon website and booking experience for **NF Signature Salon**.
Built with a black-and-gold design system inspired by modern salon booking platforms —
but with original branding, content and layout.

> **Scope of this repository:** the **client frontend only**. The Express/Node
> backend (`salonbook-server`) is developed separately and is **not** part of this
> build. The client is prepared for easy API integration (see below).

---

## Tech stack

| Layer | Technology |
| --- | --- |
| UI library | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 + a small global CSS design-system layer |
| Routing | React Router DOM v7 |
| Linting | oxlint |
| HTTP | Native `fetch` (no extra HTTP dependency) |

---

## Getting started

```bash
cd client
npm install

# optional: copy the environment template and adjust values
cp .env.example .env

npm run dev       # start the dev server
npm run build     # type-check + production build
npm run lint      # oxlint
npm run preview   # preview the production build
```

The dev server prints a local URL (typically `http://localhost:5173`).

---

## Environment variables

All variables are optional for local development. `.env` is git-ignored; only
`.env.example` is committed. Never put secrets in the frontend bundle.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the Express API (e.g. `http://localhost:5000/api`). |
| `VITE_USE_MOCK_DATA` | `true` (default) uses local fixtures for catalog/dashboard data. Set `false` to call the real API for everything. |
| `VITE_GOOGLE_MAPS_API_KEY` | Public Google Maps JS key for the location map (restrict by origin). |
| `VITE_SALON_ADDRESS`, `VITE_SALON_POSTAL_CODE` | Confirmed salon address for directions/map. |
| `VITE_SALON_LATITUDE`, `VITE_SALON_LONGITUDE` | Optional verified coordinates. |
| `VITE_SALON_PHONE`, `VITE_SALON_EMAIL` | Owner-confirmed contact details. |
| `VITE_SALON_INSTAGRAM_URL`, `VITE_SALON_FACEBOOK_URL`, `VITE_SALON_TIKTOK_URL` | Official social profiles. |
| `VITE_SALON_HOURS_<DAY>` | Opening hours per day (`SUNDAY` … `SATURDAY`). |

Only configured values are shown — the UI never invents an address, phone number,
opening hours or social profile.

---

## Mock vs. live API mode

`VITE_USE_MOCK_DATA` defaults to **true** so the UI can be reviewed before the
backend exists:

- **Mocked (default):** service catalogue, customer dashboard, admin dashboard and
  the booking confirmation use clearly separated fixtures in
  `src/services/mockData.ts` and `src/services/api/*`.
- **Never mocked:** authentication (`/signin`, `/signup`) always calls the real
  API — there are no demo credentials.
- **Demo booking:** while mock mode is on, the booking confirmation is explicitly
  labelled as a **non-persisted demo**. It never claims that a row was written to
  a database.
- Set `VITE_USE_MOCK_DATA=false` to route every request through
  `VITE_API_BASE_URL`.

---

## Routes

| Area | Route | Page |
| --- | --- | --- |
| Public | `/` | Home (hero, booking search, categories, featured, reviews, location, FAQ, CTA) |
| Public | `/services` | Services listing (search, category filter, price sort) |
| Public | `/services/:serviceId` | Service details |
| Public | `/gallery` | Gallery with accessible lightbox |
| Public | `/booking` | Appointment booking flow |
| Public | `/about` | About the salon |
| Public | `/contact` | Contact details + message form |
| Auth | `/signin` | Sign in |
| Auth | `/signup` | Create account |
| Customer | `/dashboard` | Customer overview |
| Customer | `/dashboard/appointments` | Appointment history |
| Customer | `/dashboard/profile` | Profile |
| Admin | `/admin` | Admin dashboard |
| Admin | `/admin/bookings` | Manage bookings |
| Admin | `/admin/services` | Manage services |
| Admin | `/admin/customers` | Customers |
| Fallback | `*` | 404 |

Dashboard and admin routes are guarded by `DashboardAccessGate` and require a
valid backend session; the server must enforce the same role rules with JWT
middleware.

---

## Booking flow

`/booking` is a three-step, accessible flow:

1. **Service** — choose from the live (or mock) catalogue.
2. **Date & time** — pick a date, then check availability. Slots come from
   `GET /appointments/availability` — the client never fabricates time slots.
3. **Your details** — name, email, phone and optional notes, then review and submit.

The flow includes validation, loading/error states, a sticky summary, and a
confirmation screen. **No payment details are collected online**, and the demo
confirmation is labelled as such.

---

## Folder structure

```
client/src/
├── App.tsx                 # Route map
├── main.tsx                # Providers + React root
├── index.css               # Design tokens + component styles
├── assets/                 # Images / static assets
├── components/
│   ├── auth/               # AuthLayout
│   ├── booking/            # Stepper, summary, confirmation
│   ├── common/             # Button, ButtonLink, Icon, FormField, states, etc.
│   ├── dashboard/          # Dashboard shell + tables + cards
│   ├── home/               # Hero, booking search, categories, featured, reviews, FAQ, location, CTA
│   ├── layout/             # Navbar, Footer, Layout
│   └── services/           # ServiceCard, ServiceImage, filters, category meta
├── context/                # AuthProvider + ToastProvider
├── hooks/                  # useApiResource, useServices, useAuth, useToast
├── lib/                    # cn() class-name helper
├── pages/                  # Route-level pages (incl. pages/dashboard/*)
├── services/
│   ├── api/                # Centralized API client + endpoint modules
│   ├── mockData.ts         # Development fixtures (isolated from API logic)
│   ├── config.ts           # API base URL + mock toggle
│   ├── salonConfig.ts      # Env-driven salon details
│   └── authStorage.ts      # Token storage abstraction
├── types/                  # Shared TypeScript interfaces
└── utils/                  # Formatting, errors, constants
```

---

## API integration preparation

- **One API client** (`src/services/api/client.ts`) builds every request from
  `VITE_API_BASE_URL`, attaches the bearer token, maps error responses and emits
  a global `401` event so `AuthProvider` can clear an expired session.
- **Endpoint modules** keep UI components free of URLs
  (`auth.ts`, `services.ts`, `availability.ts`, `appointments.ts`, `customer.ts`,
  `admin.ts`, `contact.ts`).
- **Typed interfaces** live in `src/types/index.ts`.
- **Reusable data hooks** (`useApiResource`, `useServices`) provide consistent
  `data / loading / error / refetch` behavior.
- **Mock data is isolated** in `src/services/mockData.ts` and can be switched off
  with one environment variable.
- No production API URLs or secrets are hard-coded.

Expected backend contracts are documented in [`API_CONTRACTS.md`](./API_CONTRACTS.md).

---

## Build & quality checks

```bash
npm run build   # tsc -b && vite build  → passes
npm run lint    # oxlint                → 0 warnings, 0 errors
```

The production build is type-checked and passes. There is no automated unit/E2E
suite yet; the quality gate currently consists of TypeScript strict checking,
oxlint and manual route/form review.

---

## Known limitations

1. **Backend not connected** — authentication, real bookings and contact delivery
   require the Express API. In the default mock mode the catalogue/dashboard data
   is fixture data and the booking confirmation is an explicitly labelled demo.
2. **Google Maps** needs `VITE_GOOGLE_MAPS_API_KEY` and a confirmed address;
   otherwise an honest placeholder is shown.
3. **Reviews** are clearly labelled sample cards; replace with verified feedback
   before launch.
4. **Salon details** (address, phone, hours, social links) are shown only when
   configured through environment variables.
5. **No automated test suite** yet (see above).

---

## Git development stages

The client was built in 19 meaningful stages. Each stage was type-checked and
linted before committing. The public routes, forms, loading/error states and
responsive layouts were reviewed at the end of the build.

| # | Stage | Commit |
| --- | --- | --- |
| 01 | Audit + API baseline | `feat(client): audit project and establish API baseline` |
| 02 | Folder architecture | `feat(client): organize client folder architecture` |
| 03 | Design system / Button | `style(client): establish design system and Button component` |
| 04 | Responsive navbar & layout | `feat(client): enhance responsive navbar and layout accessibility` |
| 05 | Homepage hero | `feat(client): build homepage hero section` |
| 06 | Service categories | `feat(client): build homepage service categories` |
| 07 | Types, config, API client | `feat(client): prepare shared types, config and API client` |
| 08 | API modules + mock data | `feat(client): add API service modules and mock data` |
| 09 | Common UI components | `feat(client): build reusable common UI components` |
| 10 | Hooks & providers | `feat(client): add data hooks and auth/toast providers` |
| 11 | Service/home components | `feat(client): build service and homepage content components` |
| 12 | Navbar, footer, CSS | `style(client): enhance navbar, footer and global design system` |
| 13 | Services pages | `feat(client): implement services listing and details pages` |
| 14 | Booking interface | `feat(client): build appointment booking interface` |
| 15 | Auth UI | `feat(client): implement login and registration UI` |
| 16 | Dashboards | `feat(client): build customer and admin dashboards` |
| 17 | Gallery / contact / about | `feat(client): build gallery, contact and about pages` |
| 18 | Routes + homepage completion | `feat(client): wire routes and complete homepage sections` |
| 19 | Docs + final verification | `chore(client): finalize documentation and verify production build` |

> The repository already contained three scaffold commits (`.gitignore`,
> project docs, Vite+TS scaffold) before the 19 development stages began.

---

## Originality

This is an original design and implementation for **NF Signature Salon**. It is
inspired by the information architecture and booking patterns of modern salon
platforms but does not copy any brand's source code, logo, proprietary assets or
exact content.

---

_Built as part of Programming Hero Assignment 9 — client frontend phase._
