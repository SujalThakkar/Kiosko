import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, roleGuard } from '../auth';

const router = Router();

function componentOut(c: {
  id: number; name: string; category: string; roomId: number;
  totalQty: number; availableQty: number; reservedQty: number;
  room?: { name: string } | null;
}) {
  return {
    id:            c.id,
    name:          c.name,
    category:      c.category,
    room_id:       c.roomId,
    room_name:     c.room?.name ?? null,
    total_qty:     c.totalQty,
    available_qty: c.availableQty,
    reserved_qty:  c.reservedQty,
  };
}

// GET /components?room_id=<id>  — any authenticated user
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const roomId = req.query.room_id ? Number(req.query.room_id) : undefined;
  const components = await prisma.component.findMany({
    where: roomId !== undefined ? { roomId } : undefined,
    include: { room: true },
    orderBy: { id: 'asc' },
  });
  res.json(components.map(componentOut));
});

// POST /components — lab_assistant only, own room only
router.post('/', requireAuth, roleGuard('lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const { name, category, room_id, total_qty } = req.body as {
    name?: string; category?: string; room_id?: number; total_qty?: number;
  };
  if (!name || !category || room_id === undefined || total_qty === undefined) {
    res.status(422).json({ detail: 'name, category, room_id and total_qty are required' });
    return;
  }
  if (!req.user!.roomIds.includes(room_id)) {
    res.status(403).json({ detail: 'You can only add components to a room you administer' });
    return;
  }
  const c = await prisma.component.create({
    data: { name, category, roomId: room_id, totalQty: total_qty, availableQty: total_qty, reservedQty: 0 },
    include: { room: true },
  });
  res.json(componentOut(c));
});

export default router;
