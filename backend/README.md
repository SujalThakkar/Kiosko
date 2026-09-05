# SmartIssue Backend (Node.js + Express + Prisma)

Real, working backend for the SmartIssue lab component kiosk. SQLite database,
JWT auth, and the three access-control rules baked into the API itself (not
just the UI):

1. **Approval locks inventory.** When a lab assistant approves a request, the
   requested units move from `available_qty` into `reserved_qty` on the
   component. They cannot be granted to any other student — at the kiosk or
   anywhere else — until that specific student's request is fulfilled.
2. **Professors are read-only.** There is no approve/reject route a professor
   role can call — `roleGuard(...)` on those endpoints only accepts
   `lab_assistant`. Professors get full `GET` visibility into every request
   and report, but zero write access to the approval workflow.
3. **Approvals are room-scoped.** Every component belongs to a `Room`. Every
   lab assistant is linked to the room(s) they administer via a many-to-many
   table (`AssistantRoom`). `POST /requests/:id/approve` and `/reject` check that the
   component's room is one the calling lab assistant actually administers —
   otherwise it's a 403, not just a hidden button.

## Run it

```bash
# 1. Install dependencies and generate Prisma Client
npm install

# 2. Push schema to SQLite database (smartissue.db)
npx prisma db push

# 3. Start development server
npm run dev
```

The SQLite file (`smartissue.db`) and demo data are created automatically on
first startup (via idempotent `seed.ts`). To reset and re-seed from scratch:
```bash
rm smartissue.db
npx prisma db push
npm run dev
```

### Run Tests
```bash
npm test
```
The Jest integration test suite runs against an isolated in-memory/file test database (`test.db`), verifying authentication, room-scoped authorization, inventory locking, kiosk dispensing, and usage reports.

## Demo accounts (password for all: `password123`)

| Role | Somaiya ID | Notes |
|---|---|---|
| Student | `KJ2024-EXTC-114` | Aarav Deshmukh |
| Student | `KJ2024-EXTC-098` | Ishita Rao |
| Student | `KJ2023-COMP-045` | Kabir Shah |
| Student | `KJ2024-EXTC-072` | Meera Joshi (has an overdue IR Sensor loan) |
| Professor | `FAC-0231` | Dr. Priya Nair — read-only across all rooms |
| Lab Assistant | `LAB-0042` | Suresh Iyer — administers **Microprocessor Lab – Block C** (`MPU-C1`) only |
| Lab Assistant | `LAB-0057` | Neha Kulkarni — administers **IoT & Embedded Lab – Block A** (`IOT-A2`) only |

Log in as Suresh and Neha in two different sessions to see the room-scoping:
each only sees and can act on pending requests for their own room's
components.

## Endpoints

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/auth/login` | anyone | Returns JWT + user profile |
| GET | `/auth/me` | any logged-in user | Current user |
| GET | `/rooms` | any logged-in user | List labs/rooms |
| GET | `/components?room_id=` | any logged-in user | Inventory, optionally filtered |
| POST | `/requests` | student | Create a pending request |
| GET | `/requests?status=` | any (scoped per role) | List requests |
| POST | `/requests/:id/approve` | lab_assistant (own room only) | Lock units, approve |
| POST | `/requests/:id/reject` | lab_assistant (own room only) | Reject, no lock |
| POST | `/requests/:id/cancel` | student (own request) | Cancel, releases lock if approved |
| GET | `/issuances` | any (scoped per role) | Active/past loans |
| POST | `/issuances/:id/return` | lab_assistant (own room only) | Mark returned, restock |
| POST | `/kiosk/verify` | kiosk device (`X-Kiosk-Key` header) | NFC + CV verification, fulfills a locked request |
| GET | `/kiosk/events` | lab_assistant (own room only) | Live feed / transaction log |
| GET | `/reports/usage` | professor or lab_assistant | Aggregate stats |
| GET | `/health` | anyone | System health status |

The kiosk endpoint is authenticated with a shared device key
(`X-Kiosk-Key: smartissue-kiosk-dev-key`, configured in `.env` / `src/routes/kiosk.ts`)
rather than a user JWT, since the physical kiosk isn't a logged-in person —
swap this for a real per-device credential before deployment.

## What "locking" looks like end-to-end

1. Student requests **Breadboard × 1** → `status: pending`. No inventory change yet.
2. The assigned lab assistant (and only that lab assistant) approves it →
   `available_qty -= 1`, `reserved_qty += 1`, `status: approved`. The unit is
   now invisible to every other student's availability check.
3. Student taps their NFC card at the kiosk in that room; the camera detects
   a breadboard in the scan area. `POST /kiosk/verify` matches the detection
   against the student's approved request, sets `reserved_qty -= 1`, creates
   an `Issuance` row with a 7-day due date, and marks the request `fulfilled`.
4. If a *different* student scans the same room without an approved request
   for that item, the kiosk returns `no_approved_request` or `mismatch` and
   nothing is issued.

## Configuration (.env)

- `PORT`: HTTP port to listen on (default: `8000`)
- `DATABASE_URL`: Prisma SQLite connection string (`file:./smartissue.db`)
- `JWT_SECRET`: Secret for signing JWT authentication tokens
- `KIOSK_API_KEY`: Hardware device authentication key (`smartissue-kiosk-dev-key`)

