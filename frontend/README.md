# SmartIssue — Lab Component Kiosk (Frontend)

React + Vite + Tailwind frontend for the Somaiya Vidyavihar University lab
component issuing kiosk, wired to a real FastAPI backend (see
`../somaiya-lab-kiosk-backend`). Three role-based portals — **Student**,
**Professor**, and **Lab Assistant** — on the official SVU brand palette.

## Run it

```bash
# 1. Start the backend first (separate folder) — see its README.
# 2. Then:
npm install
cp .env.example .env    # defaults to http://localhost:8000
npm run dev
```

Open the printed local URL (usually http://localhost:5173). Sign in with any
of the demo accounts listed in the backend README (password: `password123`).

## What's real vs. what's next

**Fully functional, talking to the live backend:**
- Login (JWT), role-based routing, protected routes
- Student: browse inventory by room, submit requests, view issue history and currently-issued items
- Professor: read-only view of all requests and aggregate usage reports — **no approve/reject controls exist in this portal, by design**
- Lab Assistant: pending-approvals queue (approve/reject only works for rooms that assistant administers — enforced by the backend, not just hidden in the UI), live kiosk verification feed, inventory, active-loan records with a "mark returned" action

**Not built (out of scope for this app):**
- The physical kiosk's own touchscreen UI (NFC tap + camera scan screen) —
  that's a separate app for the Raspberry Pi, which calls the backend's
  `POST /kiosk/verify` endpoint directly. This React app is the three
  human-facing portals only.
- Somaiya SSO — login goes against the prototype's own JWT auth.
- The official Somaiya logo artwork — `SomaiyaMark.jsx` is a typographic
  placeholder; brand guidelines prohibit recreating the real logo, so swap
  in the official SVG from `brand.somaiya.edu.in` before shipping.

## Project structure

```
src/
  api/client.js          Every backend call, JWT attached automatically
  context/AuthContext.jsx  Login state, persisted to localStorage
  components/             Shared UI incl. ProtectedRoute, ScanFrame (signature motif)
  layouts/DashboardLayout.jsx   Sidebar + content shell, passes user via Outlet context
  pages/
    Login.jsx
    student/    Overview, Request, History
    professor/  Overview, Requests (read-only), Usage
    lab/        Overview, Approvals, Kiosk Feed, Inventory, Students
```

## Brand tokens (tailwind.config.js)

| Token          | Hex       | Use                                  |
|----------------|-----------|---------------------------------------|
| `power-red`    | `#B7202E` | Primary actions, student-role accent  |
| `vitality-red` | `#ED1C24` | Alerts, active states, CTAs           |
| `trust-blue`   | `#004A9C` | Secondary actions, professor accent   |
| `ink` / `slate`| `#231F20` / `#58595B` | Text                     |
| `mist` / `paper` | `#F4F5F7` / `#FFFFFF` | Backgrounds            |

Fonts: Marcellus (display) + Fira Sans (body) — SVU's official typefaces,
loaded from Google Fonts in `index.html`.
