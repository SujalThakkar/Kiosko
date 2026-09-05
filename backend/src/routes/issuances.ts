import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, roleGuard } from '../auth';

const router = Router();

// -----------------------------------------------------------------------
// Compute loan status — mirrors _status() in Python issuances_router.py
// -----------------------------------------------------------------------
function loanStatus(i: { returnedAt: Date | null; dueAt: Date | null }): string {
  if (i.returnedAt) return 'returned';
  if (i.dueAt && i.dueAt < new Date()) return 'overdue';
  return 'issued';
}

interface IssuanceWithRelations {
  id: number;
  requestId: number;
  studentId: number;
  componentId: number;
  qty: number;
  issuedAt: Date;
  dueAt: Date | null;
  returnedAt: Date | null;
  component: { name: string };
  student:   { name: string };
}

function issuanceOut(i: IssuanceWithRelations) {
  return {
    id:             i.id,
    component_name: i.component.name,
    student_name:   i.student.name,
    qty:            i.qty,
    issued_at:      i.issuedAt,
    due_at:         i.dueAt,
    returned_at:    i.returnedAt,
    status:         loanStatus(i),
  };
}

const includeAll = {
  component: { select: { name: true, roomId: true } },
  student:   { select: { name: true } },
} as const;

// -----------------------------------------------------------------------
// GET /issuances — role-scoped
// -----------------------------------------------------------------------
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const where: Record<string, unknown> = {};

  if (user.role === 'student') {
    where['studentId'] = user.id;
  } else if (user.role === 'lab_assistant') {
    where['component'] = { roomId: { in: user.roomIds } };
  }
  // professor: no filter — read-only visibility across every room

  const issuances = await prisma.issuance.findMany({
    where,
    include: includeAll,
    orderBy: { issuedAt: 'desc' },
  });
  res.json(issuances.map((i) => issuanceOut(i as IssuanceWithRelations)));
});

// -----------------------------------------------------------------------
// POST /issuances/:id/return — lab_assistant, own room only
// Restocks available_qty when item is returned
// -----------------------------------------------------------------------
router.post('/:id/return', requireAuth, roleGuard('lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  const i = await prisma.issuance.findUnique({
    where: { id },
    include: { component: { select: { roomId: true, name: true } }, student: { select: { name: true } } },
  });
  if (!i) { res.status(404).json({ detail: 'Issuance not found' }); return; }
  if (!req.user!.roomIds.includes(i.component.roomId)) {
    res.status(403).json({ detail: 'You can only process returns for a lab you administer' });
    return;
  }
  if (i.returnedAt) { res.status(400).json({ detail: 'This item was already marked as returned' }); return; }

  // Restock — put the units back on the shelf
  await prisma.component.update({
    where: { id: i.componentId },
    data: { availableQty: { increment: i.qty } },
  });

  const updated = await prisma.issuance.update({
    where: { id },
    data: { returnedAt: new Date() },
    include: includeAll,
  });
  res.json(issuanceOut(updated as IssuanceWithRelations));
});

export default router;
