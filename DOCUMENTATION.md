# SmartIssue — Full-Stack Architecture & Operational Guide

> **Somaiya Vidyavihar University — Lab Component Kiosk System**  
> A full-stack system designed to manage, lock, issue, and track laboratory components across university departments with strict role-based access control (RBAC), room-scoped administration, and automated kiosk integration.

---

## 📋 Table of Contents

1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Key Business & Access Rules](#2-key-business--access-rules)
3. [Backend Deep-Dive (Node.js + Express + Prisma + SQLite)](#3-backend-deep-dive-nodejs--express--prisma--sqlite)
4. [Frontend Deep-Dive (React + Vite + Tailwind)](#4-frontend-deep-dive-react--vite--tailwind)
5. [Prerequisites & Environment Setup](#5-prerequisites--environment-setup)
6. [Step-by-Step Execution Guide](#6-step-by-step-execution-guide)
7. [Demo Accounts & End-to-End Walkthrough](#7-demo-accounts--end-to-end-walkthrough)
8. [API Endpoint Directory](#8-api-endpoint-directory)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. System Overview & Architecture

**SmartIssue** automates the request, approval, inventory locking, kiosk dispensing, and return cycle for laboratory components (e.g., Microcontrollers, Breadboards, Sensors) at Somaiya Vidyavihar University.

### Architecture Diagram

```
                       +-----------------------------------+
                       |      Physical Kiosk Hardware      |
                       |  (NFC Reader + Camera Scan / CV)  |
                       +-----------------+-----------------+
                                         |
                                         | POST /kiosk/verify
                                         | Header: X-Kiosk-Key
                                         v
+------------------+   HTTP / REST   +---------------------+    Prisma ORM     +-------------------+
|  React 18 + Vite | <-------------> |  Node.js / Express  | <---------------> | SQLite Database   |
|  Frontend Client |   Bearer JWT    |  (TypeScript)       |   Prisma Client   |  (smartissue.db)  |
+------------------+                 +---------------------+                   +-------------------+
  (Port 5173)                           (Port 8000)
  - Student Portal
  - Professor Portal
  - Lab Assistant Portal
```

---

## 2. Key Business & Access Rules

The entire backend and frontend are architected around three non-negotiable security and inventory management principles:

1. **Inventory Locking on Approval**
   - When a request is created, inventory quantities remain unchanged (`status: pending`).
   - Upon Lab Assistant approval, the requested quantity moves from `available_qty` to `reserved_qty` (`status: approved`).
   - The units are immediately locked and rendered invisible to other students for issue or reservation.
2. **Professors are Read-Only**
   - Faculty members can monitor component usage, track student borrowing history, and review aggregate reports across all rooms.
   - The server strictly rejects any write/approve actions from the `professor` role via `roleGuard(...)` middleware checks (returns `403 Forbidden`).
3. **Room-Scoped Lab Assistant Approvals**
   - Laboratory components belong to specific rooms (labs).
   - Lab assistants administer specific rooms assigned via a many-to-many relationship (`AssistantRoom`).
   - A lab assistant can ONLY approve/reject requests or manage inventory for components in their assigned room(s). Attempting to approve an item outside their room results in a server-enforced `403 Forbidden`.

---

## 3. Backend Deep-Dive (Node.js + Express + Prisma + SQLite)

Located in [`backend/`](file:///d:/College/TY/Sem-5/CEPDT/Kiosko/backend)

### Tech Stack
* **Runtime & Language**: Node.js v18+ / TypeScript 5.5
* **HTTP Framework**: Express 4.21 with CORS & JSON body parsing
* **Database & ORM**: SQLite 3 / Prisma ORM 5.19
* **Authentication**: JWT (JSON Web Tokens via `jsonwebtoken`) & Password Hashing via `bcrypt`
* **Test Suite**: Jest 29 + `ts-jest` + Supertest (comprehensive end-to-end integration tests)

### Code Base Structure
```
backend/
├── prisma/
│   └── schema.prisma        # Prisma database schema (User, Room, Component, ComponentRequest, Issuance, KioskEvent)
├── src/
│   ├── index.ts             # Application entry point, seed trigger & server listen
│   ├── app.ts               # Express app instance, CORS middleware, route mounting & error handlers
│   ├── prisma.ts            # Singleton PrismaClient client export
│   ├── auth.ts              # JWT signing/verification, bcrypt hashing, requireAuth & roleGuard middleware
│   ├── seed.ts              # Idempotent DB initialization and demo data seeder
│   └── routes/              # Modular API endpoints
│       ├── auth.ts          # Login & /auth/me endpoints
│       ├── rooms.ts         # Lab room catalog
│       ├── components.ts    # Inventory CRUD & room scoping
│       ├── requests.ts      # Request pipeline (create, approve, reject, cancel)
│       ├── issuances.ts     # Loan records & item returns
│       ├── kiosk.ts         # Kiosk hardware integration (verify, live events)
│       └── reports.ts       # Analytics for faculty & lab assistants
├── tests/
│   ├── backend.test.ts      # Full end-to-end Jest test suite covering all RBAC & flows
│   ├── global-setup.ts      # Automated test DB migration setup
│   └── setup-env.ts         # Test environment variable injector
├── smartissue.db            # Generated SQLite database file
├── package.json             # NPM scripts and dependencies
├── tsconfig.json            # TypeScript compiler configuration
├── jest.config.ts           # Jest test configuration
└── README.md                # Backend quick-reference
```

---

## 4. Frontend Deep-Dive (React + Vite + Tailwind)

Located in [`frontend/`](file:///d:/College/TY/Sem-5/CEPDT/Kiosko/frontend)

### Tech Stack
* **Framework**: React 18.3 + Vite 5.4
* **Styling**: Tailwind CSS 3.4 + PostCSS
* **Routing**: React Router DOM 6.26
* **Icons**: Lucide React
* **Typography**: Marcellus (headings) + Fira Sans (body text) — Official SVU typography

### Code Base Structure
```
frontend/
├── src/
│   ├── main.jsx             # React DOM root mounting
│   ├── App.jsx              # Router provider & route configurations
│   ├── index.css            # Base Tailwind imports & SVU font imports
│   ├── api/
│   │   └── client.js        # Centralized Fetch wrapper with auto JWT header injection
│   ├── context/
│   │   └── AuthContext.jsx  # User session context (login, logout, token persistence)
│   ├── components/
│   │   ├── ProtectedRoute.jsx # Auth & Role-based route guard
│   │   ├── ScanFrame.jsx      # UI signature motif
│   │   └── SomaiyaMark.jsx    # Typography brand placeholder
│   ├── layouts/
│   │   └── DashboardLayout.jsx# Responsive sidebar navigation frame
│   └── pages/
│       ├── Login.jsx          # Multi-role authentication portal
│       ├── student/           # Student Portal (Overview, Request, History)
│       ├── professor/         # Professor Portal (Overview, Requests, Usage Analytics)
│       └── lab/               # Lab Assistant Portal (Approvals, Inventory, Kiosk Feed, Students)
├── index.html               # Vite HTML template
├── package.json             # NPM dependencies and run scripts
├── tailwind.config.js       # Brand color palette & typography tokens
└── vite.config.js           # Vite dev server configuration (port 5173)
```

---

## 5. Prerequisites & Environment Setup

Before running the application, ensure you have the following installed on your machine:

* **Node.js**: `v18.0` or higher (verify with `node -v`)
* **Package Manager**: `npm` (Node Package Manager)

---

## 6. Step-by-Step Execution Guide

To run SmartIssue locally, you will need **two open terminal windows** (one for the backend and one for the frontend).

### Terminal 1: Launching the Backend API

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Node.js dependencies & generate Prisma client**:
   ```bash
   npm install
   ```
   *(The `postinstall` script automatically runs `prisma generate`)*

3. **Initialize the SQLite database schema**:
   ```bash
   npx prisma db push
   ```

4. **Start the TypeScript development server**:
   ```bash
   npm run dev
   ```
   * *The database (`smartissue.db`) will automatically initialize and populate with seed data on first boot.*
   * *Backend URL*: `http://localhost:8000`
   * *Health Endpoint*: `http://localhost:8000/health`

5. *(Optional)* **Run the automated test suite**:
   ```bash
   npm test
   ```

---

### Terminal 2: Launching the Frontend Portal

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Create the environment file**:
   * **Windows (PowerShell / CMD)**:
     ```powershell
     copy .env.example .env
     ```
   * **Linux / macOS**:
     ```bash
     cp .env.example .env
     ```
   *(Ensures `VITE_API_BASE_URL=http://localhost:8000` is defined)*

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   * *Frontend URL*: `http://localhost:5173`

---

## 7. Demo Accounts & End-to-End Walkthrough

### Pre-Seeded Accounts

> **Password for ALL accounts**: `password123`

| Role | Somaiya ID | User Name | Assigned Access Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `KJ2024-EXTC-098` | Ishita Rao | EXTC Department Student |
| **Student** | `KJ2024-EXTC-114` | Aarav Deshmukh | EXTC Department Student |
| **Student** | `KJ2023-COMP-045` | Kabir Shah | Computer Eng. Student |
| **Student** | `KJ2024-EXTC-072` | Meera Joshi | Student with active/overdue loan |
| **Lab Assistant** | `LAB-0042` | Suresh Iyer | **Microprocessor Lab – Block C** (`MPU-C1`) ONLY |
| **Lab Assistant** | `LAB-0057` | Neha Kulkarni | **IoT & Embedded Lab – Block A** (`IOT-A2`) ONLY |
| **Professor** | `FAC-0231` | Dr. Priya Nair | Read-only access across ALL labs |

---

### Recommended Testing Workflow

1. **Submit a Request (Student)**:
   - Open `http://localhost:5173` and log in as student `KJ2024-EXTC-098`.
   - Go to **Request Component**, select **Microprocessor Lab**, choose **8085 Microprocessor Kit**, and submit a request.
   - Status will show as **Pending Approval**.

2. **Approve & Lock Inventory (Lab Assistant)**:
   - Open an Incognito window or log out, and log in as `LAB-0042` (Suresh Iyer - Microprocessor Lab Assistant).
   - Navigate to **Approvals Queue**. You will see Ishita's request.
   - Click **Approve**. Observe the **Inventory** tab: `available_qty` decreases by 1 and `reserved_qty` increases by 1.

3. **Test Room-Scoped Security**:
   - Log out and log in as `LAB-0057` (Neha Kulkarni - IoT Lab Assistant).
   - Check the Approvals queue. Notice that Ishita's request for Microprocessor Lab does NOT appear here, preventing cross-room approvals.

4. **Verify Read-Only Mode (Professor)**:
   - Log in as `FAC-0231` (Dr. Priya Nair).
   - View the **Requests** tab. Notice you can observe Ishita's approved request, but no approve/reject buttons exist in the UI or backend.

5. **Simulate Kiosk Hardware Pickup (cURL)**:
   - Open a terminal and run the following request (simulating an NFC tap + camera detection at the kiosk):
     ```bash
     curl -X POST http://localhost:8000/kiosk/verify \
       -H "Content-Type: application/json" \
       -H "X-Kiosk-Key: smartissue-kiosk-dev-key" \
       -d "{\"somaiya_id\": \"KJ2024-EXTC-098\", \"room_id\": \"MPU-C1\", \"detected_component_code\": \"8085-KIT\"}"
     ```
   - *Result*: The request changes to `fulfilled`, `reserved_qty` decreases, an active `Issuance` record is created, and a event log is pushed to the Live Kiosk Feed.

---

## 8. API Endpoint Directory

### Authentication & Core
* `POST /auth/login` — Authenticate user and receive JWT bearer token + user profile.
* `GET /auth/me` — Return profile of currently authenticated token holder.

### Laboratory & Components
* `GET /rooms` — List all lab rooms.
* `GET /components?room_id={id}` — List inventory components (optionally filtered by lab room).
* `POST /components` — Add new component (Lab Assistant for their own room only).

### Request Pipeline
* `POST /requests` — Submit a component borrowing request (Student).
* `GET /requests?status={status}` — Retrieve requests (filtered by user role and room scope).
* `POST /requests/{id}/approve` — Approve request & lock inventory (Lab Assistant, assigned room only).
* `POST /requests/{id}/reject` — Reject request (Lab Assistant, assigned room only).
* `POST /requests/{id}/cancel` — Cancel request and release locked inventory (Student).

### Issuances & Returns
* `GET /issuances` — Retrieve active and historical component loans.
* `POST /issuances/{id}/return` — Mark component returned and restock `available_qty` (Lab Assistant).

### Physical Kiosk Integration
* `POST /kiosk/verify` — Hardware endpoint (`X-Kiosk-Key` protected) verifying NFC student ID and camera component scan.
* `GET /kiosk/events` — Live stream/log of recent kiosk interactions for lab assistants.

### Reports & Analytics
* `GET /reports/usage` — Aggregate component usage statistics and department metrics.

---

## 9. Troubleshooting & FAQs

### Q1: The backend server fails to start with `PrismaClientInitializationError` or missing Prisma Client.
* **Fix**: Run `npx prisma generate` inside the `backend` directory to regenerate the Prisma client artifacts.

### Q2: How do I reset the database to its initial clean state?
* **Fix**: Stop the backend server, delete the `backend/smartissue.db` file, run `npx prisma db push`, and restart `npm run dev`. The seeder will recreate the demo database automatically.

### Q3: Frontend requests fail with `NetworkError` or CORS errors.
* **Fix**: Verify that the backend is running on `http://localhost:8000`. Ensure `frontend/.env` contains `VITE_API_BASE_URL=http://localhost:8000`.

### Q4: How do I run the automated integration tests?
* **Fix**: In the `backend` directory, run:
  ```powershell
  npm test
  ```
  This creates an isolated temporary test database (`test.db`), runs all RBAC and inventory flow tests, and verifies all endpoints.

---
*Documented for Somaiya Vidyavihar University CEPDT Project.*
