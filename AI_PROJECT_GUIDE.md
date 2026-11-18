# NF Signature Salon — AI Project Guide

## Project Overview

**NF Signature Salon** is a full-stack web application for a premium beauty salon.  
The brand identity revolves around a **black and gold** luxury aesthetic.

---

## Tech Stack

### Client (Frontend)
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State:** React Context / useState / useEffect
- **HTTP Client:** Axios

### Server (Backend) — _Start only after client approval_
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Environment:** dotenv

---

## Project Structure

```
NF Signature Salon/
├── client/                  # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/          # Images, fonts, icons
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Helper functions
│   │   └── styles/          # Global styles / theme
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Express backend (DO NOT START YET)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
├── .gitignore
├── AI_PROJECT_GUIDE.md      # This file
└── TASK_TRACKER.md          # Progress tracker
```

---

## Brand & Design Guidelines

| Token | Value |
|-------|-------|
| Primary (Gold) | `#C9A84C` / `#B8962E` |
| Background (Black) | `#0A0A0A` / `#111111` |
| Surface | `#1A1A1A` |
| Text (White) | `#F5F5F5` |
| Accent | `#E8C76D` |
| Font (Headings) | Playfair Display (serif) |
| Font (Body) | Inter / Lato (sans-serif) |

---

## Pages to Build (Client)

| Priority | Page | Route | Status |
|----------|------|-------|--------|
| 1 | Homepage | `/` | ⏳ Pending |
| 2 | Services | `/services` | ⏳ Pending |
| 3 | Gallery | `/gallery` | ⏳ Pending |
| 4 | Booking | `/booking` | ⏳ Pending |
| 5 | About | `/about` | ⏳ Pending |
| 6 | Contact | `/contact` | ⏳ Pending |
| 7 | 404 | `*` | ⏳ Pending |

---

## Development Rules

1. **Client first** — Server development requires explicit approval.
2. **Never commit secrets** — `.env`, API keys, passwords are strictly gitignored.
3. **Conventional Commits** — Every commit must follow the convention.
4. **No broken pushes** — Only push working, tested code.
5. **Update TASK_TRACKER.md** after every task.
6. **Responsive design** — Mobile-first, works on all screen sizes.
7. **Accessibility** — Semantic HTML, proper aria labels, keyboard navigation.

---

## Git Conventions

```
feat(client):   New feature on the client side
feat(server):   New feature on the server side
fix(client):    Bug fix on the client side
style(client):  Styling / theme changes
refactor:       Code refactoring
docs:           Documentation updates
chore:          Setup, config, tooling
test:           Adding or updating tests
```

---

_Last updated: 2026-11-18_
