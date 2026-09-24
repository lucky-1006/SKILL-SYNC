import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';

export const notificationsRouter = Router();

notificationsRouter.get('/notifications', authenticate, async (_req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst({ include: { user: true } });
    if (!student) return res.json([]);

    const notifications = await prisma.notification.findMany({
      where: { userId: student.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

notificationsRouter.patch('/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});
