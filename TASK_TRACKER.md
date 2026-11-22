# NF Signature Salon — Task Tracker

> Updated after every development stage.

---

## 🏁 Project Status: **Client complete (frontend phase)**

**Phase:** Client Development (Frontend) — ✅ complete
**Server:** ⛔ Not started — awaiting approval
**Last Updated:** 2026-11-21

---

## ✅ Completed — Client Frontend

### Foundation

- [x] Git repository, `main` branch, `.gitignore`, remote
- [x] `AI_PROJECT_GUIDE.md` + this tracker
- [x] React + Vite + TypeScript scaffold
- [x] Tailwind CSS v4 + custom black/gold design-system tokens
- [x] React Router DOM route map
- [x] `@/` path alias and professional folder structure

### Components

- [x] `Navbar` — responsive, scroll-aware, auth-aware, accessible mobile menu
- [x] `Footer` — brand, navigation, contact, hours, socials, copyright
- [x] `Layout` — shared shell + scroll-to-top on navigation
- [x] `Button` / `ButtonLink` — primary / outline / text / danger variants
- [x] `Icon`, `FormField`, `PageHeader`, `SectionHeader`, `OpeningHours`
- [x] `EmptyState`, `ErrorState`, `LoadingState`, `Skeleton`, `Spinner`, `StatusBadge`
- [x] `ServiceCard`, `ServiceImage`, `ServiceFilters`, `ServiceCardSkeleton`, `CategoryIcon`
- [x] `HeroSection` + `BookingSearch`
- [x] `ServiceCategories`, `FeaturedServices`, `ClientReviews`, `SalonLocation`, `SalonFaq`, `CtaSection`
- [x] `BookingStepper`, `BookingSummary`, `BookingConfirmation`
- [x] Dashboard shell, stat cards, tables, access gate
- [x] Auth layout

### Pages

- [x] `HomePage` (`/`) — hero, booking search, categories, featured, reviews, map, FAQ, CTA
- [x] `ServicesPage` (`/services`) — search, category filter, price sort, loading/error/empty states
- [x] `ServiceDetailsPage` (`/services/:serviceId`) — details, includes, related services, booking CTA
- [x] `BookingPage` (`/booking`) — 3-step flow, availability, summary, confirmation
- [x] `GalleryPage` (`/gallery`) — accessible lightbox gallery
- [x] `SignInPage` (`/signin`) — validation, error/loading states
- [x] `SignUpPage` (`/signup`) — validation, error/loading states
- [x] `AboutPage` (`/about`) — story, values, expectations, visiting
- [x] `ContactPage` (`/contact`) — details, hours, map link, message form
- [x] `NotFoundPage` (`*`) — custom 404
- [x] Customer dashboard (`/dashboard`, `/dashboard/appointments`, `/dashboard/profile`)
- [x] Admin dashboard (`/admin`, `/admin/bookings`, `/admin/services`, `/admin/customers`)

### Architecture & data

- [x] Centralized API client with `VITE_API_BASE_URL`, bearer token and 401 handling
- [x] Env-driven runtime config (`config.ts`, `salonConfig.ts`, `.env.example`)
- [x] Typed API interfaces (`src/types/index.ts`)
- [x] API endpoint modules (`auth`, `services`, `availability`, `appointments`, `customer`, `admin`, `contact`)
- [x] Data hooks (`useApiResource`, `useServices`, `useAuth`, `useToast`)
- [x] Auth + toast providers
- [x] Mock data isolated from API logic; `VITE_USE_MOCK_DATA` toggle
- [x] Documented expected backend contracts (`client/API_CONTRACTS.md`)

### Quality

- [x] Responsive layouts for mobile / tablet / desktop
- [x] Accessibility: semantic markup, labels, aria attributes, focus styles, keyboard support
- [x] Loading, empty and error states across data-driven views
- [x] `npm run build` passes
- [x] `npm run lint` — 0 warnings, 0 errors
- [x] No hard-coded production API URLs or secrets
- [x] README + API contract documentation

---

## 📌 Client known limitations

| Item | Status / note |
| --- | --- |
| Backend connection | Pending `salonbook-server`. Default `VITE_USE_MOCK_DATA=true`. |
| Real bookings | Booking confirmation is an explicitly labelled demo in mock mode; no database write. |
| Authentication | UI is complete; requires the real `/auth/*` API. No demo credentials. |
| Google Maps | Requires a Maps API key + confirmed address; otherwise a placeholder is shown. |
| Reviews | Clearly labelled sample cards; replace with verified feedback. |
| Salon details | Address/phone/hours/socials shown only when configured via env vars. |
| Automated tests | No unit/E2E suite yet; gate is TypeScript + oxlint + manual review. |

---

## ⛔ Pending Tasks — Server (Awaiting Approval)

- [x] Initialize Express server
- [x] Connect MongoDB (Mongoose)
- [x] Auth routes (register / login / JWT / me / logout) — audited & verified 2026-11-22
- [ ] Services API routes
- [ ] Availability calculation (opening hours, holidays, staff, duration, active bookings)
- [ ] Appointment creation with server-side slot revalidation
- [ ] Customer dashboard/profile endpoints
- [ ] Admin dashboard/booking/service/customer endpoints
- [ ] Contact delivery endpoint
- [x] Role middleware (`customer` / `admin`) — implemented
- [ ] Payment integration (out of current scope)

See `client/API_CONTRACTS.md` for the exact request/response shapes.

---

## 🔐 Authentication Audit — 2026-11-22

**Status:** ✅ Email/password sign-up, login, session restore and logout verified end-to-end.

Findings:
- `409` on sign-up = the email already existed (expected guard) and, in the old
  client, a double-submit race could send two registrations (first 201, second 409).
  Fixed with synchronous submit locks on both auth forms.
- `401` on login = the password did not match the stored hash for that account,
  and the old client could clear a fresh session when a late 401 from the previous
  `/auth/me` restore arrived. Fixed with a session-generation guard and by only
  invalidating the exact token that produced the 401.
- Database audit: 15 users, all with valid `$2b$` bcrypt hashes, normalized emails,
  unique `email_1` index and sparse `googleId_1` index — no corrupted accounts.
- Server auth hardening (validated env config, CORS, rate limiting, async token
  validation, hidden password hash, optional Google OAuth) committed.
- `.env` and `dist/` remain git-ignored in both repos; no secrets committed.

Verification:
- `cd salonbook-server && npm run test:auth` → all checks pass; throwaway user removed.
- `cd client && npm run build && npm run lint` → pass.
- Manual: register → sign out → sign in → dashboard.

Account recovery (unknown/old password):
`cd salonbook-server && npm run reset-password -- <email>` (hidden prompt or
`RESET_PASSWORD`). Full details: `salonbook-server/AUTH.md`.

---

## 📝 Notes

- Brand colors: Gold `#C9A84C`, Black `#0A0A0A`, Ivory `#F5F0E8`
- Fonts: Playfair Display (headings) + Inter (body)
- Mobile-first responsive design
- No server work until the client phase is approved
- Never commit `.env` or secrets — only `.env.example`

---

## 📊 Progress Summary

```
Client:  ██████████  100% (frontend complete)
Server:  █████░░░░░   50% (auth complete; booking/catalog APIs pending)
Overall: ███████░░░   70%
```
