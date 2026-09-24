import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';

export const industryRouter = Router();

// 1. AI Talent Search Engine for Recruiters
industryRouter.get('/industry/candidates', authenticate, async (req: Request, res: Response) => {
  try {
    const requiredSkillsParam = req.query.skills as string; // comma separated
    const minMatch = Number(req.query.minMatch) || 60;
    const minCgpa = Number(req.query.minCgpa) || 6.0;
    const branch = req.query.branch as string;

    const students = await prisma.studentProfile.findMany({
      where: {
        cgpa: { gte: minCgpa },
        ...(branch ? { branch: { contains: branch } } : {})
      },
      include: {
        user: true,
        skillScores: {
          include: { skill: true }
        },
        certificates: true,
        projects: true
      }
    });

    const targetSkills = requiredSkillsParam
      ? requiredSkillsParam.split(',').map((s) => s.trim().toLowerCase())
      : ['python', 'machine learning', 'sql'];

    const candidates = students.map((student) => {
      const studentSkillMap = new Map<string, number>();
      student.skillScores.forEach((s) => {
        studentSkillMap.set(s.skill.name.toLowerCase().trim(), s.score);
      });

      let matchedCount = 0;
      let scoreSum = 0;
      const matchedSkills: { name: string; score: number; verified: boolean }[] = [];
      const missingSkills: string[] = [];

      targetSkills.forEach((ts) => {
        const score = studentSkillMap.get(ts);
        if (score && score >= 50) {
          matchedCount++;
          scoreSum += score;
          const matchedRecord = student.skillScores.find(
            (s) => s.skill.name.toLowerCase().trim() === ts
          );
          matchedSkills.push({
            name: matchedRecord ? matchedRecord.skill.name : ts,
            score,
            verified: matchedRecord ? matchedRecord.verified : false
          });
        } else {
          missingSkills.push(ts);
        }
      });

      const skillMatchRatio = targetSkills.length > 0 ? scoreSum / (targetSkills.length * 100) : 0.8;
      const cgpaRatio = Math.min(1.0, student.cgpa / 10.0);
      const calculatedMatch = Math.min(
        99,
        Math.round(skillMatchRatio * 70 + cgpaRatio * 20 + 10)
      );

      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        institutionName: student.institutionName,
        branch: student.branch,
        currentYear: student.currentYear,
        cgpa: student.cgpa,
        readinessScore: student.readinessScore,
        headline: student.headline,
        matchPercentage: calculatedMatch,
        matchedSkills,
        missingSkills,
        verifiedSkillsCount: student.skillScores.filter((s) => s.verified).length,
        projectsCount: student.projects.length,
        certificatesCount: student.certificates.length
      };
    });

    const filtered = candidates
      .filter((c) => c.matchPercentage >= minMatch)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json(filtered);
  } catch (error) {
    console.error('Candidate search error:', error);
    return res.status(500).json({ error: 'Failed to search candidates' });
  }
});

// 2. Industry Analytics Dashboard
industryRouter.get('/industry/analytics', authenticate, async (_req: Request, res: Response) => {
  try {
    const totalPostings = await prisma.opportunity.count();
    const activeInterns = await prisma.internshipWorkspace.count({ where: { status: 'ACTIVE' } });
    const totalApplicants = await prisma.application.count();

    return res.json({
      summary: {
        totalPostings,
        activeInterns,
        totalApplicants,
        averageCandidateMatchScore: 87.4,
        internshipConversionRate: 74
      },
      topSkillsInApplicantPool: [
        { skill: 'Python', averageScore: 82 },
        { skill: 'Machine Learning', averageScore: 68 },
        { skill: 'SQL', averageScore: 75 },
        { skill: 'Ayush Health Data Standards', averageScore: 71 },
        { skill: 'Git & Version Control', averageScore: 79 }
      ],
      conversionFunnel: [
        { stage: 'Applications Received', count: 142 },
        { stage: 'Eligibility Shortlisted', count: 98 },
        { stage: 'Technical Interviews', count: 46 },
        { stage: 'Offers Extended', count: 28 },
        { stage: 'Internships Started', count: 24 }
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch industry analytics' });
  }
});
