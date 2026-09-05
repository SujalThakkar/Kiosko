import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, roleGuard } from '../auth';

const RequestStatus = { pending: 'pending', approved: 'approved', rejected: 'rejected', fulfilled: 'fulfilled', cancelled: 'cancelled' } as const;

const router = Router();

// Shared device key — replace with a real per-device credential before deployment.
const KIOSK_API_KEY = process.env.KIOSK_API_KEY || 'smartissue-kiosk-dev-key';

function kioskKeyGuard(req: Request, res: Response, next: () => void): void {
  if (req.headers['x-kiosk-key'] !== KIOSK_API_KEY) {
    res.status(401).json({ detail: 'Invalid or missing kiosk device key' });
    return;
  }
  next();
}

function labelsMatch(detected: string, componentName: string): boolean {
  const a = detected.trim().toLowerCase();
  const b = componentName.trim().toLowerCase();
  return a.includes(b) || b.includes(a);
}

// -----------------------------------------------------------------------
// POST /kiosk/verify
// Authenticated with X-Kiosk-Key header (device key, not a user JWT).
// Mirrors kiosk_router.py::verify()
// -----------------------------------------------------------------------
router.post('/verify', kioskKeyGuard, async (req: Request, res: Response): Promise<void> => {
  const { somaiya_id, room_code, detections } = req.body as {
    somaiya_id?: string;
    room_code?: string;
    detections?: Array<{ label: string; confidence: number }>;
  };

  if (!somaiya_id || !room_code || !Array.isArray(detections)) {
    res.status(422).json({ detail: 'somaiya_id, room_code, and detections are required' });
    return;
  }

  const student = await prisma.user.findFirst({
    where: { somaiyaId: somaiya_id, role: 'student' },
  });
  if (!student) { res.status(404).json({ detail: 'No student found for that NFC card' }); return; }

  const room = await prisma.room.findUnique({ where: { code: room_code } });
  if (!room) { res.status(404).json({ detail: 'Unknown kiosk room code' }); return; }

  // Only approved, not-yet-fulfilled requests in this room count
  const approvedRequests = await prisma.componentRequest.findMany({
    where: {
      studentId: student.id,
      status:    RequestStatus.approved,
      component: { roomId: room.id },
    },
    include: { component: true },
  });

  const detectedItems = JSON.stringify(detections);

  async function logEvent(matchStatus: string, requestId: number | null) {
    await prisma.kioskEvent.create({
      data: { studentId: student!.id, roomId: room!.id, requestId, detectedItems, matchStatus, createdAt: new Date() },
    });
  }

  if (approvedRequests.length === 0) {
    await logEvent('no_approved_request', null);
    res.json({
      match_status: 'no_approved_request',
      message: 'No approved request found for this student in this room. Ask your lab assistant to approve a request first.',
      fulfilled_requests: [],
      due_at: null,
    });
    return;
  }

  const fulfilledIds: number[] = [];
  const unmatchedRequests = [];
  const dueAt = new Date(Date.now() + 7 * 86_400_000);

  for (const r of approvedRequests) {
    const matched = detections.some((d) => labelsMatch(d.label, r.component.name));
    if (matched) {
      // Release the lock and create an issuance
      await prisma.component.update({
        where: { id: r.componentId },
        data: { reservedQty: { decrement: r.qty } },
      });
      await prisma.componentRequest.update({
        where: { id: r.id },
        data: { status: RequestStatus.fulfilled, fulfilledAt: new Date() },
      });
      await prisma.issuance.create({
        data: {
          requestId:   r.id,
          studentId:   student.id,
          componentId: r.componentId,
          qty:         r.qty,
          issuedAt:    new Date(),
          dueAt,
        },
      });
      fulfilledIds.push(r.id);
    } else {
      unmatchedRequests.push(r);
    }
  }

  if (fulfilledIds.length > 0) {
    await logEvent('match', fulfilledIds[0]);
    res.json({
      match_status:       'match',
      message:            `Verified and issued ${fulfilledIds.length} approved item(s). Have a productive session!`,
      fulfilled_requests: fulfilledIds,
      due_at:             dueAt,
    });
    return;
  }

  // Approved request exists but nothing in the scan area matched it
  await logEvent('mismatch', unmatchedRequests[0]?.id ?? null);
  res.json({
    match_status:       'mismatch',
    message:            "The items in the scan area don't match your approved request. Please check and rescan.",
    fulfilled_requests: [],
    due_at:             null,
  });
});

// -----------------------------------------------------------------------
// GET /kiosk/events — lab_assistant only, room-scoped live feed
// -----------------------------------------------------------------------
router.get('/events', requireAuth, roleGuard('lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const events = await prisma.kioskEvent.findMany({
    where: { roomId: { in: req.user!.roomIds } },
    include: { student: { select: { name: true } }, room: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(events.map((e) => ({
    id:             e.id,
    student_name:   e.student.name,
    room_name:      e.room.name,
    detected_items: e.detectedItems,
    match_status:   e.matchStatus,
    created_at:     e.createdAt,
  })));
});

export default router;
