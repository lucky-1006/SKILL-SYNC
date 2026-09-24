import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';

export const careerRouter = Router();

careerRouter.get('/career/roles', async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.careerRole.findMany({
      orderBy: { industryDemandPercentage: 'desc' }
    });

    return res.json(
      roles.map((r) => ({
        id: r.id,
        title: r.title,
        domain: r.domain,
        description: r.description,
        avgSalary: r.avgSalary,
        industryDemandPercentage: r.industryDemandPercentage,
        requiredSkills: JSON.parse(r.requiredSkillsJson)
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch career roles' });
  }
});

careerRouter.get('/career/roadmap/:roleId', authenticate, async (req: Request, res: Response) => {
  try {
    const role = await prisma.careerRole.findUnique({
      where: { id: req.params.roleId }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const student = await prisma.studentProfile.findFirst();
    const months = JSON.parse(role.roadmapJson || '[]');

    return res.json({
      roleId: role.id,
      roleTitle: role.title,
      overallReadinessScore: student?.readinessScore || 75,
      months
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

careerRouter.post('/career/set-target', authenticate, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const student = await prisma.studentProfile.findFirst();

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const updated = await prisma.studentProfile.update({
      where: { id: student.id },
      data: { targetRoleId: roleId }
    });

    return res.json({ success: true, targetRoleId: updated.targetRoleId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update target role' });
  }
});
