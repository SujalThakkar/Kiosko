import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../auth';

const router = Router();

// GET /rooms — list all lab rooms (any authenticated user)
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } });
  res.json(rooms.map((r) => ({ id: r.id, name: r.name, code: r.code })));
});

export default router;
