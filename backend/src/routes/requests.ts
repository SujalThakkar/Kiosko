import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, roleGuard } from '../auth';

const RequestStatus = { pending: 'pending', approved: 'approved', rejected: 'rejected', fulfilled: 'fulfilled', cancelled: 'cancelled' } as const;

const router = Router();

// -----------------------------------------------------------------------
// Serialiser — mirrors _out() in Python requests_router.py
// -----------------------------------------------------------------------
interface ReqWithRelations {
  id: number;
  studentId: number;
  componentId: number;
  qty: number;
  purpose: string | null;
  status: string;
  requestedAt: Date;
  decidedById: number | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  fulfilledAt: Date | null;
  student:    { name: string; somaiyaId: string };
  component:  { name: string; roomId: number; room: { name: string } };
  decidedBy?: { name: string } | null;
}

function requestOut(r: ReqWithRelations) {
  return {
    id:                 r.id,
    student_id:         r.studentId,
    student_name:       r.student.name,
    student_somaiya_id: r.student.somaiyaId,
    component_id:       r.componentId,
    component_name:     r.component.name,
    room_id:            r.component.roomId,
    room_name:          r.component.room.name,
    qty:                r.qty,
    purpose:            r.purpose,
    status:             r.status,
    requested_at:       r.requestedAt,
    decided_by_id:      r.decidedById,
    decided_by_name:    r.decidedBy?.name ?? null,
    decided_at:         r.decidedAt,
    decision_note:      r.decisionNote,
    fulfilled_at:       r.fulfilledAt,
  };
}

const includeAll = {
  student:   { select: { name: true, somaiyaId: true } },
  component: { include: { room: true } },
  decidedBy: { select: { name: true } },
} as const;

// -----------------------------------------------------------------------
// POST /requests — student: create a pending request
// -----------------------------------------------------------------------
router.post('/', requireAuth, roleGuard('student'), async (req: Request, res: Response): Promise<void> => {
  const { component_id, qty = 1, purpose } = req.body as {
    component_id?: number; qty?: number; purpose?: string;
  };
  if (!component_id) { res.status(422).json({ detail: 'component_id is required' }); return; }
  if (qty < 1)       { res.status(400).json({ detail: 'Quantity must be at least 1' }); return; }

  const component = await prisma.component.findUnique({ where: { id: component_id } });
  if (!component) { res.status(404).json({ detail: 'Component not found' }); return; }
  if (component.availableQty < qty) {
    res.status(400).json({ detail: `Only ${component.availableQty} unit(s) of ${component.name} are currently available` });
    return;
  }

  const r = await prisma.componentRequest.create({
    data: { studentId: req.user!.id, componentId: component_id, qty, purpose: purpose ?? null, status: RequestStatus.pending, requestedAt: new Date() },
    include: includeAll,
  });
  res.json(requestOut(r as ReqWithRelations));
});

// -----------------------------------------------------------------------
// GET /requests?status=<status> — role-scoped
// -----------------------------------------------------------------------
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const statusFilter = req.query.status as string | undefined;
  const user = req.user!;

  const where: Record<string, unknown> = {};

  if (user.role === 'student') {
    where['studentId'] = user.id;
  } else if (user.role === 'lab_assistant') {
    where['component'] = { room: { id: { in: user.roomIds } } };
  }
  // professor: no where clause — read-only visibility across every room

  if (statusFilter) where['status'] = statusFilter;

  const requests = await prisma.componentRequest.findMany({
    where,
    include: includeAll,
    orderBy: { requestedAt: 'desc' },
  });
  res.json(requests.map((r) => requestOut(r as ReqWithRelations)));
});

// -----------------------------------------------------------------------
// POST /requests/:id/approve — lab_assistant, own room only
// Locks units: available_qty -= qty, reserved_qty += qty
// -----------------------------------------------------------------------
router.post('/:id/approve', requireAuth, roleGuard('lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { note } = req.body as { note?: string };

  const r = await prisma.componentRequest.findUnique({ where: { id }, include: { component: true } });
  if (!r) { res.status(404).json({ detail: 'Request not found' }); return; }
  if (r.status !== RequestStatus.pending) { res.status(400).json({ detail: `Request is already ${r.status}` }); return; }

  // ROOM-SCOPING: the component's room must be one this assistant administers
  if (!req.user!.roomIds.includes(r.component.roomId)) {
    res.status(403).json({ detail: 'You can only approve requests for components in a lab you administer' });
    return;
  }

  if (r.component.availableQty < r.qty) {
    res.status(400).json({ detail: `Only ${r.component.availableQty} unit(s) of ${r.component.name} are currently available to lock` });
    return;
  }

  // Lock the units
  await prisma.component.update({
    where: { id: r.componentId },
    data: { availableQty: { decrement: r.qty }, reservedQty: { increment: r.qty } },
  });

  const updated = await prisma.componentRequest.update({
    where: { id },
    data: { status: RequestStatus.approved, decidedById: req.user!.id, decidedAt: new Date(), decisionNote: note ?? null },
    include: includeAll,
  });
  res.json(requestOut(updated as ReqWithRelations));
});

// -----------------------------------------------------------------------
// POST /requests/:id/reject — lab_assistant, own room only
// No inventory change (units were never locked for a pending request)
// -----------------------------------------------------------------------
router.post('/:id/reject', requireAuth, roleGuard('lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { note } = req.body as { note?: string };

  const r = await prisma.componentRequest.findUnique({ where: { id }, include: { component: true } });
  if (!r) { res.status(404).json({ detail: 'Request not found' }); return; }
  if (r.status !== RequestStatus.pending) { res.status(400).json({ detail: `Request is already ${r.status}` }); return; }

  if (!req.user!.roomIds.includes(r.component.roomId)) {
    res.status(403).json({ detail: 'You can only decide on requests for components in a lab you administer' });
    return;
  }

  const updated = await prisma.componentRequest.update({
    where: { id },
    data: { status: RequestStatus.rejected, decidedById: req.user!.id, decidedAt: new Date(), decisionNote: note ?? null },
    include: includeAll,
  });
  res.json(requestOut(updated as ReqWithRelations));
});

// -----------------------------------------------------------------------
// POST /requests/:id/cancel — student, own request only
// Releases inventory lock if the request was already approved
// -----------------------------------------------------------------------
router.post('/:id/cancel', requireAuth, roleGuard('student'), async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  const r = await prisma.componentRequest.findUnique({ where: { id }, include: { component: true } });
  if (!r) { res.status(404).json({ detail: 'Request not found' }); return; }
  if (r.studentId !== req.user!.id) { res.status(403).json({ detail: 'You can only cancel your own requests' }); return; }
  if (r.status !== RequestStatus.pending && r.status !== RequestStatus.approved) {
    res.status(400).json({ detail: `Request is already ${r.status}` });
    return;
  }

  // If approved, the units were locked — release them back to general availability
  if (r.status === RequestStatus.approved) {
    await prisma.component.update({
      where: { id: r.componentId },
      data: { reservedQty: { decrement: r.qty }, availableQty: { increment: r.qty } },
    });
  }

  const updated = await prisma.componentRequest.update({
    where: { id },
    data: { status: RequestStatus.cancelled },
    include: includeAll,
  });
  res.json(requestOut(updated as ReqWithRelations));
});

export default router;
