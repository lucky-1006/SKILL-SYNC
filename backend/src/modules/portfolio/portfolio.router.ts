import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';
import { SkillCategory } from '@skillsync/shared';

export const portfolioRouter = Router();

portfolioRouter.get('/portfolio/student', authenticate, async (_req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst({
      include: {
        user: true,
        skillScores: { include: { skill: true } },
        projects: true,
        certificates: true
      }
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    return res.json({
      studentId: student.id,
      fullName: student.user.name,
      headline: student.headline || 'AI & Healthcare Data Science Enthusiast',
      institutionName: student.institutionName,
      branch: student.branch,
      currentYear: student.currentYear,
      cgpa: student.cgpa,
      readinessScore: student.readinessScore,
      bio: student.bio,
      skills: student.skillScores.map((s) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        category: s.skill.category as SkillCategory,
        score: s.score,
        verified: s.verified,
        verificationStatus: s.verificationStatus,
        verifiedBy: s.verifiedBy,
        verifiedAt: s.verifiedAt?.toISOString()
      })),
      projects: student.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        skillsUsed: JSON.parse(p.skillsUsed || '[]'),
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        verifiedByMentor: p.verifiedByMentor,
        mentorComments: p.mentorComments
      })),
      certificates: student.certificates.map((c) => ({
        id: c.id,
        title: c.title,
        issuingOrganization: c.issuingOrganization,
        issueDate: c.issueDate,
        verificationCode: c.verificationCode,
        verificationStatus: c.verificationStatus,
        verifiedBy: c.verifiedBy
      })),
      completedInternships: [
        {
          title: 'AI & Healthcare Data Science Intern',
          company: 'TCS Bio-IT & Life Sciences R&D',
          duration: 'Current (Active)',
          performanceRating: 4.9,
          mentorRecommendation: 'High analytical competence; spearheaded preprocessing pipelines across multi-source Ayush datasets.'
        }
      ],
      honorsAndAchievements: [
        'Top 10 Finalist - SIH Smart Automation Hackathon 2026',
        'Academic Excellence Merit Scholarship - AIIA Delhi',
        'Best Biomedical Paper Presentation - National Ayush Tech Summit'
      ],
      publicShareableUrl: `https://skillsync.gov.in/p/${student.id}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student portfolio' });
  }
});

// Verify certificate by code (publicly accessible)
portfolioRouter.get('/portfolio/verify/:code', async (req: Request, res: Response) => {
  try {
    const cert = await prisma.verifiedCertificate.findFirst({
      where: { verificationCode: req.params.code },
      include: {
        student: { include: { user: true } }
      }
    });

    if (!cert) {
      return res.status(404).json({ valid: false, message: 'Certificate code not recognized.' });
    }

    return res.json({
      valid: true,
      title: cert.title,
      studentName: cert.student.user.name,
      institution: cert.student.institutionName,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      verifiedBy: cert.verifiedBy,
      verificationCode: cert.verificationCode
    });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});
