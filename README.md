# SmartIssue — Somaiya Vidyavihar University Lab Component Kiosk

Full-stack prototype: a React frontend (Student / Professor / Lab Assistant
portals) and a Node.js / Express / Prisma / TypeScript backend enforcing the three access-control rules this
project is built around:

1. **Locking.** Approving a request locks those units — they're removed from
   general availability and cannot be issued to anyone else, at the kiosk or
   anywhere, until the approved student collects them.
2. **Professors are read-only.** They can see every request and usage report,
   but there is no approve/reject action available to that role, anywhere —
   enforced server-side, not just hidden in the UI.
3. **Room-scoped approval.** Every component belongs to a room/lab. Every lab
   assistant administers specific room(s). A lab assistant can only approve
   or reject requests for components in a room they administer — the backend
   returns `403 Forbidden` otherwise.

## Quick start

**Terminal 1 — backend:**
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173, sign in with any account from
`backend/README.md` (password `password123` for all), and try the workflow:

1. Log in as a **student** (`KJ2024-EXTC-098`) → request a component.
2. Log in as the matching **lab assistant** (`LAB-0042` for Microprocessor
   Lab, `LAB-0057` for IoT & Embedded Lab) → approve it. Watch the inventory
   numbers move from "available" to "locked" in the Inventory tab.
3. Log in as the **professor** (`FAC-0231`) → confirm you can see the
   request but there's no approve/reject button anywhere.
4. Simulate the kiosk finishing the transaction with curl (see
   `backend/README.md` → "What locking looks like end-to-end" for the exact
   request), then check the lab assistant's Live Kiosk Feed and Student
   Records pages update.

## Folders

- `frontend/` — Vite + React + Tailwind, official SVU brand colors/fonts. See `frontend/README.md`.
- `backend/` — Node.js + Express + Prisma + SQLite, JWT auth, seeded demo data. See `backend/README.md`.

## What's not built yet

- The physical kiosk's own touchscreen app (NFC tap + camera scan UI) — this
  repo covers the three human portals only. The kiosk device would call
  `POST /kiosk/verify` on the backend directly.
- Somaiya SSO integration (auth is the prototype's own JWT for now).
- The official Somaiya logo artwork (a text placeholder is used instead, per
  brand guidelines against recreating the logo).
