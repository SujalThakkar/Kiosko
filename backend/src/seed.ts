/**
 * seed.ts — exact port of Python seed.py
 *
 * Creates all demo rooms, users, components, requests, issuances, and kiosk
 * events in the database. Called automatically on first startup and in tests.
 * If any rooms already exist the function returns immediately (idempotent).
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './auth';

const DEMO_PASSWORD = 'password123';

// String constants matching the values stored in SQLite
const Role = { student: 'student', professor: 'professor', lab_assistant: 'lab_assistant' } as const;
const RequestStatus = { pending: 'pending', approved: 'approved', rejected: 'rejected', fulfilled: 'fulfilled', cancelled: 'cancelled' } as const;
type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export async function seed(prisma: PrismaClient): Promise<void> {
  // Idempotency guard — if rooms exist, data is already seeded.
  const existing = await prisma.room.findFirst();
  if (existing) return;

  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() - hours * 3_600_000);
  const d = (days: number) => new Date(now.getTime() - days * 86_400_000);

  const pwHash = await hashPassword(DEMO_PASSWORD);

  // -------------------------------------------------------------------------
  // Rooms
  // -------------------------------------------------------------------------
  const roomA = await prisma.room.create({ data: { name: 'Microprocessor Lab – Block C', code: 'MPU-C1' } });
  const roomB = await prisma.room.create({ data: { name: 'IoT & Embedded Lab – Block A', code: 'IOT-A2' } });

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  await prisma.user.create({
    data: {
      name: 'Dr. Priya Nair', somaiyaId: 'FAC-0231',
      passwordHash: pwHash, role: Role.professor,
      department: 'Electronics & Telecommunication',
    },
  });

  const suresh = await prisma.user.create({
    data: {
      name: 'Suresh Iyer', somaiyaId: 'LAB-0042',
      passwordHash: pwHash, role: Role.lab_assistant,
      department: 'Microprocessor Lab, Block C',
      rooms: { connect: [{ id: roomA.id }] },
    },
  });

  const neha = await prisma.user.create({
    data: {
      name: 'Neha Kulkarni', somaiyaId: 'LAB-0057',
      passwordHash: pwHash, role: Role.lab_assistant,
      department: 'IoT & Embedded Lab, Block A',
      rooms: { connect: [{ id: roomB.id }] },
    },
  });

  const aarav  = await prisma.user.create({ data: { name: 'Aarav Deshmukh',  somaiyaId: 'KJ2024-EXTC-114', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });
  const ishita = await prisma.user.create({ data: { name: 'Ishita Rao',       somaiyaId: 'KJ2024-EXTC-098', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });
  const kabir  = await prisma.user.create({ data: { name: 'Kabir Shah',       somaiyaId: 'KJ2023-COMP-045', passwordHash: pwHash, role: Role.student, department: 'Computer Engineering' } });
  const meera  = await prisma.user.create({ data: { name: 'Meera Joshi',      somaiyaId: 'KJ2024-EXTC-072', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });
  const rohan  = await prisma.user.create({ data: { name: 'Rohan Patil',      somaiyaId: 'KJ2024-EXTC-061', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });
  const devika = await prisma.user.create({ data: { name: 'Devika Menon',     somaiyaId: 'KJ2024-EXTC-089', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });
  const yash   = await prisma.user.create({ data: { name: 'Yash Kulkarni',    somaiyaId: 'KJ2024-EXTC-103', passwordHash: pwHash, role: Role.student, department: 'EXTC' } });

  // -------------------------------------------------------------------------
  // Components (room_a — MPU-C1)
  // -------------------------------------------------------------------------
  const arduino     = await prisma.component.create({ data: { name: 'Arduino Uno R3',       category: 'Microcontroller',        roomId: roomA.id, totalQty: 40,  availableQty: 36, reservedQty: 0 } });
  const jumper      = await prisma.component.create({ data: { name: 'Jumper Wires (M-M)',    category: 'Cabling',                roomId: roomA.id, totalQty: 300, availableQty: 210, reservedQty: 0 } });
  const breadboard  = await prisma.component.create({ data: { name: 'Breadboard (Full Size)', category: 'Prototyping',           roomId: roomA.id, totalQty: 20,  availableQty: 18, reservedQty: 0 } });
  const irSensor    = await prisma.component.create({ data: { name: 'IR Sensor Module',      category: 'Sensor',                 roomId: roomA.id, totalQty: 30,  availableQty: 26, reservedQty: 2 } });
  const multimeter  = await prisma.component.create({ data: { name: 'Multimeter',            category: 'Instrument',             roomId: roomA.id, totalQty: 10,  availableQty: 9,  reservedQty: 0 } });

  // Components (room_b — IOT-A2)
  const esp32  = await prisma.component.create({ data: { name: 'ESP32 Dev Board',        category: 'Microcontroller',         roomId: roomB.id, totalQty: 25, availableQty: 6, reservedQty: 4 } });
  const dcMotor= await prisma.component.create({ data: { name: 'DC Motor',               category: 'Actuator',                roomId: roomB.id, totalQty: 15, availableQty: 3, reservedQty: 2 } });
  const raspi  = await prisma.component.create({ data: { name: 'Raspberry Pi 4',         category: 'Single-board Computer',   roomId: roomB.id, totalQty: 10, availableQty: 5, reservedQty: 1 } });
  const l293d  = await prisma.component.create({ data: { name: 'L293D Motor Driver IC',  category: 'IC',                      roomId: roomB.id, totalQty: 20, availableQty: 14, reservedQty: 0 } });

  // -------------------------------------------------------------------------
  // Helper: create a ComponentRequest
  // -------------------------------------------------------------------------
  const req = async (
    student: { id: number },
    component: { id: number },
    qty: number,
    purpose: string,
    status: RequestStatus,
    opts: {
      decidedBy?: { id: number };
      decidedAt?: Date;
      note?: string;
      fulfilledAt?: Date;
      requestedAt?: Date;
    } = {},
  ) =>
    prisma.componentRequest.create({
      data: {
        studentId:   student.id,
        componentId: component.id,
        qty,
        purpose,
        status,
        requestedAt:  opts.requestedAt  ?? now,
        decidedById:  opts.decidedBy?.id ?? null,
        decidedAt:    opts.decidedAt    ?? null,
        decisionNote: opts.note         ?? null,
        fulfilledAt:  opts.fulfilledAt  ?? null,
      },
    });

  // -------------------------------------------------------------------------
  // Pending requests
  // -------------------------------------------------------------------------
  await req(aarav,  esp32,     1, 'IoT Mini Project',    RequestStatus.pending, { requestedAt: h(2) });
  await req(ishita, dcMotor,   2, 'Robotics Lab',         RequestStatus.pending, { requestedAt: h(3) });
  await req(ishita, l293d,     1, 'Robotics Lab',         RequestStatus.pending, { requestedAt: h(3) });
  await req(kabir,  raspi,     1, 'Capstone Project',     RequestStatus.pending, { requestedAt: h(5) });
  await req(ishita, breadboard,1, 'Circuits Lab',         RequestStatus.pending, { requestedAt: h(6) });

  // Rejected
  await req(kabir, multimeter, 1, 'Personal project', RequestStatus.rejected, {
    decidedBy: suresh, decidedAt: d(1),
    note: 'Please use the shared lab multimeter instead of a personal issue.',
    requestedAt: new Date(d(1).getTime() - 2 * 3_600_000),
  });

  // -------------------------------------------------------------------------
  // Approved (awaiting pickup — units LOCKED in reservedQty)
  // -------------------------------------------------------------------------
  await req(devika, irSensor, 2, 'Line-follower project',      RequestStatus.approved, { decidedBy: suresh, decidedAt: h(20), requestedAt: h(22) });
  await req(yash,   esp32,    3, 'Smart Irrigation Project',   RequestStatus.approved, { decidedBy: neha,   decidedAt: h(18), requestedAt: h(20) });
  await req(devika, esp32,    1, 'Smart Irrigation Project',   RequestStatus.approved, { decidedBy: neha,   decidedAt: h(18), requestedAt: h(19) });
  await req(meera,  dcMotor,  2, 'Robotics Lab',               RequestStatus.approved, { decidedBy: neha,   decidedAt: h(15), requestedAt: h(16) });
  await req(rohan,  raspi,    1, 'Home Automation Project',    RequestStatus.approved, { decidedBy: neha,   decidedAt: h(10), requestedAt: h(11) });

  // -------------------------------------------------------------------------
  // Fulfilled — collected at the kiosk, tracked as Issuances
  // -------------------------------------------------------------------------
  const reqBreadboard    = await req(aarav,  breadboard, 1, 'Circuits Lab',                    RequestStatus.fulfilled, { decidedBy: suresh, decidedAt: d(15), fulfilledAt: d(15), requestedAt: new Date(d(15).getTime() - 3_600_000) });
  const reqArdKabir      = await req(kabir,  arduino,    2, 'Microprocessor Lab Assignment 3', RequestStatus.fulfilled, { decidedBy: suresh, decidedAt: d(5),  fulfilledAt: d(5),  requestedAt: new Date(d(5).getTime()  - 3_600_000) });
  const reqArdIshita     = await req(ishita, arduino,    2, 'Microprocessor Lab Assignment 3', RequestStatus.fulfilled, { decidedBy: suresh, decidedAt: d(3),  fulfilledAt: d(3),  requestedAt: new Date(d(3).getTime()  - 3_600_000) });
  const reqIrMeera       = await req(meera,  irSensor,   2, 'Line-follower project',           RequestStatus.fulfilled, { decidedBy: suresh, decidedAt: d(10), fulfilledAt: d(10), requestedAt: new Date(d(10).getTime() - 3_600_000) });
  const reqMmRohan       = await req(rohan,  multimeter, 1, 'Debugging circuit fault',         RequestStatus.fulfilled, { decidedBy: suresh, decidedAt: d(8),  fulfilledAt: d(8),  requestedAt: new Date(d(8).getTime()  - 3_600_000) });

  // -------------------------------------------------------------------------
  // Issuances
  // -------------------------------------------------------------------------
  await prisma.issuance.createMany({
    data: [
      { requestId: reqBreadboard.id,  studentId: aarav.id,  componentId: breadboard.id, qty: 1, issuedAt: d(15), dueAt: d(8),  returnedAt: d(7) },
      { requestId: reqArdKabir.id,    studentId: kabir.id,  componentId: arduino.id,    qty: 2, issuedAt: d(5),  dueAt: new Date(now.getTime() + 2 * 86_400_000), returnedAt: null },
      { requestId: reqArdIshita.id,   studentId: ishita.id, componentId: arduino.id,    qty: 2, issuedAt: d(3),  dueAt: new Date(now.getTime() + 4 * 86_400_000), returnedAt: null },
      { requestId: reqIrMeera.id,     studentId: meera.id,  componentId: irSensor.id,   qty: 2, issuedAt: d(10), dueAt: d(3),  returnedAt: null },
      { requestId: reqMmRohan.id,     studentId: rohan.id,  componentId: multimeter.id, qty: 1, issuedAt: d(8),  dueAt: d(1),  returnedAt: null },
    ],
  });

  // -------------------------------------------------------------------------
  // Kiosk event log (live feed / transaction log)
  // -------------------------------------------------------------------------
  await prisma.kioskEvent.createMany({
    data: [
      {
        studentId: kabir.id, roomId: roomA.id, requestId: reqArdKabir.id,
        detectedItems: JSON.stringify([{ label: 'Arduino Uno', confidence: 0.99 }, { label: 'Jumper Wire', confidence: 0.91 }]),
        matchStatus: 'match', createdAt: d(5),
      },
      {
        studentId: ishita.id, roomId: roomA.id, requestId: reqArdIshita.id,
        detectedItems: JSON.stringify([{ label: 'Arduino Uno', confidence: 0.97 }]),
        matchStatus: 'match', createdAt: d(3),
      },
      {
        studentId: meera.id, roomId: roomA.id, requestId: reqIrMeera.id,
        detectedItems: JSON.stringify([{ label: 'IR Sensor', confidence: 0.94 }]),
        matchStatus: 'match', createdAt: d(10),
      },
      {
        studentId: kabir.id, roomId: roomB.id, requestId: null,
        detectedItems: JSON.stringify([{ label: 'Raspberry Pi 4', confidence: 0.88 }]),
        matchStatus: 'no_approved_request', createdAt: h(1),
      },
    ],
  });

  console.log('✅  Database seeded with demo data.');
}
