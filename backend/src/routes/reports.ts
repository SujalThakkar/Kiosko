import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, roleGuard } from '../auth';

const router = Router();

// GET /reports/usage — professor or lab_assistant
router.get('/usage', requireAuth, roleGuard('professor', 'lab_assistant'), async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const now  = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  // Lab assistants see only their own room(s); professors see everything
  const where = user.role === 'lab_assistant'
    ? { component: { roomId: { in: user.roomIds } } }
    : {};

  const allIssuances = await prisma.issuance.findMany({
    where,
    include: { component: { select: { name: true } } },
  });

  const issuedThisWeek = allIssuances.filter((i) => i.issuedAt >= weekAgo);
  const overdue        = allIssuances.filter((i) => !i.returnedAt && i.dueAt && i.dueAt < now);
  const activeStudents = new Set(allIssuances.filter((i) => !i.returnedAt).map((i) => i.studentId));

  // Most-issued component this week
  const nameCounts = issuedThisWeek.reduce<Record<string, number>>((acc, i) => {
    acc[i.component.name] = (acc[i.component.name] ?? 0) + 1;
    return acc;
  }, {});
  const mostIssuedItem = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  res.json({
    total_issued_this_week: issuedThisWeek.length,
    active_students:        activeStudents.size,
    overdue_count:          overdue.length,
    most_issued_item:       mostIssuedItem,
  });
});

export default router;
