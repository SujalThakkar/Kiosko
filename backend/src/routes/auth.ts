import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { hashPassword, requireAuth, signToken, verifyPassword } from '../auth';

const router = Router();

// -----------------------------------------------------------------------
// Helper: serialise a User to the wire shape the frontend expects.
// Mirrors _user_out() in Python auth_router.py
// -----------------------------------------------------------------------
async function userOut(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { rooms: { select: { id: true } } },
  });
  return {
    id:         user.id,
    name:       user.name,
    somaiya_id: user.somaiyaId,
    role:       user.role,
    department: user.department,
    room_ids:   user.rooms.map((r) => r.id),
  };
}

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { somaiya_id, password } = req.body as { somaiya_id?: string; password?: string };
  if (!somaiya_id || !password) {
    res.status(422).json({ detail: 'somaiya_id and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { somaiyaId: somaiya_id } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ detail: 'Invalid Somaiya ID or password' });
    return;
  }

  const token = signToken(user.id, user.role as 'student' | 'professor' | 'lab_assistant');
  res.json({ access_token: token, token_type: 'bearer', user: await userOut(user.id) });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  res.json(await userOut(req.user!.id));
});

export default router;
