/**
 * tests/backend.test.ts
 *
 * Port of the Python test_backend.py — 9 tests covering:
 *   health, login (student / lab_assistant / invalid), rooms, components,
 *   full student→approval flow with room-scoping, kiosk verify, and reports.
 */
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';
import { seed } from '../src/seed';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
async function login(somaiyaId: string, password = 'password123') {
  const res = await request(app)
    .post('/auth/login')
    .send({ somaiya_id: somaiyaId, password });
  return res;
}

async function authHeader(somaiyaId: string) {
  const res = await login(somaiyaId);
  return { Authorization: `Bearer ${res.body.access_token as string}` };
}

// -----------------------------------------------------------------------
// Test lifecycle
// -----------------------------------------------------------------------
beforeAll(async () => {
  // globalSetup already ran prisma db push --force-reset on test.db
  // Seed demo data into the clean schema
  await seed(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

test('health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('login_student', async () => {
  const res = await login('KJ2024-EXTC-098');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('access_token');
  expect(res.body.user.role).toBe('student');
});

test('login_lab_assistant', async () => {
  const res = await login('LAB-0042');
  expect(res.status).toBe(200);
  expect(res.body.user.role).toBe('lab_assistant');
  expect(res.body.user.room_ids.length).toBeGreaterThan(0);
});

test('login_invalid', async () => {
  const res = await login('INVALID', 'wrongpassword');
  expect(res.status).toBe(401);
});

test('list_rooms', async () => {
  const res = await request(app)
    .get('/rooms')
    .set(await authHeader('KJ2024-EXTC-098'));
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(2);
});

test('list_components', async () => {
  const res = await request(app)
    .get('/components')
    .set(await authHeader('KJ2024-EXTC-098'));
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test('student_request_and_lab_assistant_approval_flow', async () => {
  // 1. Student creates a pending request for Arduino Uno R3 (id 1, room MPU-C1)
  const sHeaders = await authHeader('KJ2024-EXTC-098');
  const reqRes = await request(app)
    .post('/requests')
    .set(sHeaders)
    .send({ component_id: 1, qty: 1, purpose: 'Testing Flow' });

  expect(reqRes.status).toBe(200);
  const reqId = reqRes.body.id as number;
  expect(reqRes.body.status).toBe('pending');

  // 2. Neha (LAB-0057) administers IOT-A2 only — approving an MPU-C1 request must be 403
  const nehaHeaders = await authHeader('LAB-0057');
  const forbiddenRes = await request(app)
    .post(`/requests/${reqId}/approve`)
    .set(nehaHeaders)
    .send({ note: 'Should fail' });
  expect(forbiddenRes.status).toBe(403);

  // 3. Suresh (LAB-0042) administers MPU-C1 — approval must succeed and lock units
  const sureshHeaders = await authHeader('LAB-0042');
  const approveRes = await request(app)
    .post(`/requests/${reqId}/approve`)
    .set(sureshHeaders)
    .send({ note: 'Approved for lab work' });
  expect(approveRes.status).toBe(200);
  expect(approveRes.body.status).toBe('approved');
});

test('kiosk_verification', async () => {
  // Devika Menon (KJ2024-EXTC-089) has a seeded approved IR Sensor request in MPU-C1
  const res = await request(app)
    .post('/kiosk/verify')
    .set('X-Kiosk-Key', 'smartissue-kiosk-dev-key')
    .send({
      somaiya_id: 'KJ2024-EXTC-089',
      room_code:  'MPU-C1',
      detections: [{ label: 'IR Sensor Module', confidence: 0.98 }],
    });

  expect(res.status).toBe(200);
  expect(res.body.match_status).toBe('match');
  expect(res.body.fulfilled_requests.length).toBeGreaterThan(0);
});

test('reports_usage', async () => {
  const res = await request(app)
    .get('/reports/usage')
    .set(await authHeader('FAC-0231'));
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('total_issued_this_week');
  expect(res.body).toHaveProperty('active_students');
});
