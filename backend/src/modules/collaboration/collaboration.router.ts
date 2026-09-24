import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';

export const collaborationRouter = Router();

// 1. Mentorship Slots
collaborationRouter.get('/collaboration/mentorship', async (_req: Request, res: Response) => {
  try {
    const slots = await prisma.mentorshipSlot.findMany();
    return res.json(
      slots.map((s) => ({
        id: s.id,
        mentorName: s.mentorName,
        mentorTitle: s.mentorTitle,
        companyName: s.companyName,
        expertiseAreas: JSON.parse(s.expertiseAreas || '[]'),
        availableSlots: JSON.parse(s.availableSlots || '[]'),
        maxMentees: s.maxMentees,
        currentMenteesCount: s.currentMenteesCount,
        bio: s.bio
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch mentorship slots' });
  }
});

// Book mentorship
collaborationRouter.post('/collaboration/mentorship/book', authenticate, async (req: Request, res: Response) => {
  try {
    const { slotId, selectedTime, studentNotes } = req.body;
    const slot = await prisma.mentorshipSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    await prisma.mentorshipSlot.update({
      where: { id: slotId },
      data: { currentMenteesCount: slot.currentMenteesCount + 1 }
    });

    return res.json({
      success: true,
      message: `Confirmed 1-on-1 mentorship session with ${slot.mentorName} for ${selectedTime}.`,
      mentor: slot.mentorName,
      time: selectedTime
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to book mentorship' });
  }
});

// 2. Innovation Challenges
collaborationRouter.get('/collaboration/challenges', async (_req: Request, res: Response) => {
  try {
    const challenges = await prisma.innovationChallenge.findMany();
    return res.json(
      challenges.map((c) => ({
        id: c.id,
        title: c.title,
        industryName: c.industryName,
        problemStatement: c.problemStatement,
        domain: c.domain,
        prizePool: c.prizePool,
        submissionDeadline: c.submissionDeadline,
        evaluationCriteria: JSON.parse(c.evaluationCriteria || '[]'),
        registeredTeamsCount: c.registeredTeamsCount
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// 3. Research Proposals
collaborationRouter.get('/collaboration/research', async (_req: Request, res: Response) => {
  try {
    const proposals = await prisma.researchProposal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(
      proposals.map((p) => ({
        id: p.id,
        title: p.title,
        leadFacultyName: p.leadFacultyName,
        institutionName: p.institutionName,
        partnerIndustryName: p.partnerIndustryName,
        focusArea: p.focusArea,
        objectives: JSON.parse(p.objectives || '[]'),
        fundingExpected: p.fundingExpected,
        durationMonths: p.durationMonths,
        status: p.status
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch research proposals' });
  }
});
