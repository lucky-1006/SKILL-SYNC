import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';

export const academiciansRouter = Router();

// 1. Faculty Dashboard Summary
academiciansRouter.get('/academicians/dashboard', authenticate, async (_req: Request, res: Response) => {
  try {
    const faculty = await prisma.academicianProfile.findFirst({
      include: { user: true }
    });

    if (!faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    const activeProposals = await prisma.researchProposal.count();
    const availableFDPs = await prisma.opportunity.count({
      where: { type: 'FDP' }
    });
    const facultyInternships = await prisma.opportunity.count({
      where: { type: 'FACULTY_INTERNSHIP' }
    });

    return res.json({
      profile: {
        id: faculty.id,
        name: faculty.user.name,
        email: faculty.user.email,
        institutionName: faculty.institutionName,
        department: faculty.department,
        designation: faculty.designation,
        specializations: faculty.specializations.split(',').map((s) => s.trim()),
        yearsExperience: faculty.yearsExperience,
        publicationsCount: faculty.publicationsCount,
        patentsCount: faculty.patentsCount,
        bio: faculty.bio
      },
      stats: {
        activeProposals,
        availableFDPs,
        facultyInternships,
        consultancyProjects: 2
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch academician dashboard' });
  }
});

// 2. Submit Joint Research Proposal
academiciansRouter.post('/academicians/proposals', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, partnerIndustryName, focusArea, objectives, fundingExpected, durationMonths } =
      req.body;

    const faculty = await prisma.academicianProfile.findFirst({
      include: { user: true }
    });

    const proposal = await prisma.researchProposal.create({
      data: {
        title,
        leadFacultyName: faculty ? faculty.user.name : 'Dr. Priya Nambiar',
        institutionName: faculty ? faculty.institutionName : 'All India Institute of Ayurveda',
        partnerIndustryName: partnerIndustryName || 'TCS Bio-IT & Life Sciences R&D',
        focusArea,
        objectives: JSON.stringify(objectives || []),
        fundingExpected: fundingExpected || '₹25,00,000',
        durationMonths: Number(durationMonths) || 12,
        status: 'SUBMITTED'
      }
    });

    return res.status(201).json(proposal);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit proposal' });
  }
});
