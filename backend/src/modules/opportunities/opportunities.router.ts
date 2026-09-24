import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';
import { MatchingService, StudentMatchProfile, OpportunityMatchTarget } from '../matching/matching.service';
import { SkillExtractorService } from './services/skill-extractor.service';
import { ProviderRegistryService } from './providers/provider-registry.service';
import { OpportunitySyncService } from './services/opportunity-sync.service';

export const opportunitiesRouter = Router();

// Helper to get or mock active student profile
async function getStudentProfileForUser(userId?: string): Promise<{
  profile: StudentMatchProfile;
  studentId: string | null;
  savedOppIds: Set<string>;
}> {
  const student = await prisma.studentProfile.findFirst({
    include: {
      skillScores: {
        include: { skill: true }
      },
      savedOpportunities: true
    }
  });

  if (!student) {
    return {
      profile: {
        id: 'guest',
        branch: 'Computer Science & Engineering',
        currentYear: 3,
        cgpa: 8.5,
        skills: []
      },
      studentId: null,
      savedOppIds: new Set()
    };
  }

  const savedOppIds = new Set(student.savedOpportunities.map((s) => s.opportunityId));

  return {
    profile: {
      id: student.id,
      branch: student.branch,
      currentYear: student.currentYear,
      cgpa: student.cgpa,
      skills: student.skillScores.map((s) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        score: s.score
      })),
      targetRoleTitle: 'AI & Machine Learning Engineer'
    },
    studentId: student.id,
    savedOppIds
  };
}

// 1. List opportunities with real-time Explainable Matching & Multi-Filtering
opportunitiesRouter.get('/opportunities', authenticate, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const sourceType = req.query.sourceType as string; // 'NATIVE', 'EXTERNAL', 'ALL'
    const workMode = req.query.workMode as string;
    const location = req.query.location as string;
    const search = req.query.search as string;
    const skill = req.query.skill as string;
    const savedOnly = req.query.savedOnly === 'true';
    const isPaginated = req.query.paginated === 'true';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const { profile: studentProfile, studentId, savedOppIds } = await getStudentProfileForUser(
      (req as any).user?.id
    );

    const where: any = {
      status: { not: 'EXPIRED' }
    };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (sourceType && sourceType !== 'ALL') {
      where.sourceType = sourceType;
    }

    if (workMode && workMode !== 'ALL') {
      where.workMode = workMode;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (savedOnly && studentId) {
      where.id = { in: Array.from(savedOppIds) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { companyName: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (skill) {
      where.OR = where.OR || [];
      where.OR.push(
        { requiredSkillsJson: { contains: skill } },
        { normalizedSkillsJson: { contains: skill } }
      );
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const results = opportunities.map((opp) => {
      const eligibleBranches: string[] = JSON.parse(opp.eligibleBranches || '[]');
      const eligibleYears: number[] = JSON.parse(opp.eligibleYears || '[]');
      const requiredSkills = JSON.parse(opp.requiredSkillsJson || '[]');

      const matchTarget: OpportunityMatchTarget = {
        id: opp.id,
        title: opp.title,
        location: opp.location,
        workMode: opp.workMode,
        minCgpa: opp.minCgpa,
        eligibleBranches,
        eligibleYears,
        requiredSkills
      };

      const matchScore = MatchingService.calculateMatch(studentProfile, matchTarget);

      return {
        id: opp.id,
        title: opp.title,
        type: opp.type,
        sourceType: opp.sourceType || 'NATIVE',
        source: opp.source || 'INTERNAL',
        sourceId: opp.sourceId,
        sourceUrl: opp.sourceUrl,
        applicationUrl: opp.applicationUrl,
        companyId: opp.companyId,
        companyName: opp.companyName,
        companyLogo: opp.companyLogo,
        location: opp.location,
        country: opp.country || 'India',
        state: opp.state,
        city: opp.city,
        remote: opp.remote,
        hybrid: opp.hybrid,
        workMode: opp.workMode,
        employmentType: opp.employmentType,
        description: opp.description,
        stipendOrSalary: opp.stipendOrSalary,
        salaryMin: opp.salaryMin,
        salaryMax: opp.salaryMax,
        duration: opp.duration,
        openings: opp.openings,
        eligibleBranches,
        eligibleYears,
        minCgpa: opp.minCgpa,
        deadline: opp.deadline,
        expiresAt: opp.expiresAt?.toISOString(),
        requiredSkills,
        preferredSkills: JSON.parse(opp.preferredSkills || '[]'),
        normalizedSkills: JSON.parse(opp.normalizedSkillsJson || '[]'),
        category: opp.category,
        status: opp.status || 'ACTIVE',
        approvalStatus: opp.approvalStatus || 'APPROVED',
        createdAt: opp.createdAt.toISOString(),
        updatedAt: opp.updatedAt?.toISOString(),
        lastSyncedAt: opp.lastSyncedAt?.toISOString(),
        isSaved: savedOppIds.has(opp.id),
        matchScore
      };
    });

    // Default sort by match score descending
    results.sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore);

    if (isPaginated) {
      const total = results.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedData = results.slice((page - 1) * limit, page * limit);
      return res.json({
        data: paginatedData,
        total,
        page,
        limit,
        totalPages
      });
    }

    return res.json(results);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// 2. Opportunity detail with full explainable analysis & learning recommendations
opportunitiesRouter.get('/opportunities/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: req.params.id }
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const { profile: studentProfile, savedOppIds } = await getStudentProfileForUser(
      (req as any).user?.id
    );

    const eligibleBranches: string[] = JSON.parse(opp.eligibleBranches || '[]');
    const eligibleYears: number[] = JSON.parse(opp.eligibleYears || '[]');
    const requiredSkills = JSON.parse(opp.requiredSkillsJson || '[]');

    const matchTarget: OpportunityMatchTarget = {
      id: opp.id,
      title: opp.title,
      location: opp.location,
      workMode: opp.workMode,
      minCgpa: opp.minCgpa,
      eligibleBranches,
      eligibleYears,
      requiredSkills
    };

    const matchScore = MatchingService.calculateMatch(studentProfile, matchTarget);

    // Fetch real courses/training programs addressing candidate's missing skills
    const recommendedLearning = await MatchingService.getLearningRecommendationsForGaps(
      matchScore.missingSkills
    );
    matchScore.recommendedLearning = recommendedLearning;

    return res.json({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      sourceType: opp.sourceType || 'NATIVE',
      source: opp.source || 'INTERNAL',
      sourceId: opp.sourceId,
      sourceUrl: opp.sourceUrl,
      applicationUrl: opp.applicationUrl,
      companyId: opp.companyId,
      companyName: opp.companyName,
      companyLogo: opp.companyLogo,
      location: opp.location,
      country: opp.country || 'India',
      state: opp.state,
      city: opp.city,
      remote: opp.remote,
      hybrid: opp.hybrid,
      workMode: opp.workMode,
      employmentType: opp.employmentType,
      description: opp.description,
      stipendOrSalary: opp.stipendOrSalary,
      salaryMin: opp.salaryMin,
      salaryMax: opp.salaryMax,
      duration: opp.duration,
      openings: opp.openings,
      eligibleBranches,
      eligibleYears,
      minCgpa: opp.minCgpa,
      deadline: opp.deadline,
      expiresAt: opp.expiresAt?.toISOString(),
      requiredSkills,
      preferredSkills: JSON.parse(opp.preferredSkills || '[]'),
      normalizedSkills: JSON.parse(opp.normalizedSkillsJson || '[]'),
      category: opp.category,
      status: opp.status || 'ACTIVE',
      approvalStatus: opp.approvalStatus || 'APPROVED',
      createdAt: opp.createdAt.toISOString(),
      updatedAt: opp.updatedAt?.toISOString(),
      isSaved: savedOppIds.has(opp.id),
      matchScore
    });
  } catch (error) {
    console.error('Error fetching opportunity detail:', error);
    return res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// 3. Opportunity Skill Gap Analysis & Course Bridge Loop
opportunitiesRouter.get('/opportunities/:id/skill-gap', authenticate, async (req: Request, res: Response) => {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: req.params.id }
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const { profile: studentProfile } = await getStudentProfileForUser((req as any).user?.id);
    const requiredSkills = JSON.parse(opp.requiredSkillsJson || '[]');

    const studentSkillMap = new Map<string, number>();
    studentProfile.skills.forEach((s) => {
      studentSkillMap.set(s.skillName.toLowerCase().trim(), s.score);
    });

    const gapItems = requiredSkills.map((reqSkill: any) => {
      const studentScore = studentSkillMap.get(reqSkill.skillName.toLowerCase().trim()) ?? 0;
      const targetScore = reqSkill.minScore || 60;
      const gap = Math.max(0, targetScore - studentScore);

      let status = 'MET';
      if (studentScore === 0) status = 'CRITICAL_GAP';
      else if (gap > 15) status = 'MAJOR_GAP';
      else if (gap > 0) status = 'MINOR_GAP';

      return {
        skillName: reqSkill.skillName,
        isMandatory: reqSkill.isMandatory ?? true,
        studentScore,
        targetScore,
        gap,
        status
      };
    });

    const missingSkillNames = gapItems
      .filter((g: any) => g.gap > 0)
      .map((g: any) => g.skillName);

    const recommendedLearning = await MatchingService.getLearningRecommendationsForGaps(
      missingSkillNames
    );

    return res.json({
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      companyName: opp.companyName,
      gaps: gapItems,
      criticalGapsCount: gapItems.filter((g: any) => g.status === 'CRITICAL_GAP').length,
      recommendedLearning
    });
  } catch (error) {
    console.error('Skill gap calculation error:', error);
    return res.status(500).json({ error: 'Failed to calculate opportunity skill gaps' });
  }
});

// 4. Save / Bookmark Opportunity
opportunitiesRouter.post('/opportunities/:id/save', authenticate, async (req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst();
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const saved = await prisma.savedOpportunity.upsert({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId: req.params.id
        }
      },
      update: {},
      create: {
        studentId: student.id,
        opportunityId: req.params.id
      }
    });

    return res.json({ success: true, savedId: saved.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save opportunity' });
  }
});

// 5. Remove Bookmark / Unsave Opportunity
opportunitiesRouter.delete('/opportunities/:id/save', authenticate, async (req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst();
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    await prisma.savedOpportunity.deleteMany({
      where: {
        studentId: student.id,
        opportunityId: req.params.id
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove saved opportunity' });
  }
});

// 6. Post new Native Opportunity (Industry Recruiter or Institution)
opportunitiesRouter.post('/opportunities', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      title,
      type,
      companyName,
      companyLogo,
      location,
      workMode,
      description,
      stipendOrSalary,
      salaryMin,
      salaryMax,
      duration,
      openings,
      eligibleBranches,
      eligibleYears,
      minCgpa,
      deadline,
      requiredSkills,
      preferredSkills,
      category
    } = req.body;

    // Deterministically extract canonical skills
    const rawSkillsList = Array.isArray(requiredSkills)
      ? requiredSkills.map((s: any) => s.skillName || s)
      : [];

    const { requiredSkills: extractedSkills, normalizedSkillNames } =
      await SkillExtractorService.extractAndNormalize(title || '', description || '', rawSkillsList);

    const mergedRequiredSkills =
      Array.isArray(requiredSkills) && requiredSkills.length > 0
        ? requiredSkills
        : extractedSkills;

    const created = await prisma.opportunity.create({
      data: {
        title,
        type: type || 'INTERNSHIP',
        sourceType: 'NATIVE',
        source: 'INTERNAL',
        companyName: companyName || 'SkillSync Partner Organization',
        companyLogo: companyLogo || null,
        location: location || 'Hybrid / India',
        workMode: workMode || 'HYBRID',
        remote: workMode === 'REMOTE',
        hybrid: workMode === 'HYBRID',
        description,
        stipendOrSalary: stipendOrSalary || '₹25,000 / month',
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        duration: duration || '6 Months',
        openings: Number(openings) || 2,
        eligibleBranches: JSON.stringify(eligibleBranches || ['Computer Science & Engineering', 'Information Technology']),
        eligibleYears: JSON.stringify(eligibleYears || [2, 3, 4]),
        minCgpa: Number(minCgpa) || 6.5,
        deadline: deadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requiredSkillsJson: JSON.stringify(mergedRequiredSkills),
        preferredSkills: JSON.stringify(preferredSkills || []),
        normalizedSkillsJson: JSON.stringify(normalizedSkillNames),
        category: category || 'Information Technology',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED'
      }
    });

    // Notify registered students about high relevance opportunity
    const students = await prisma.studentProfile.findMany({
      include: { user: true },
      take: 5
    });

    for (const s of students) {
      await prisma.notification.create({
        data: {
          userId: s.userId,
          title: `New Opportunity: ${created.title}`,
          message: `${created.companyName} just posted a new ${created.type} role matching your discipline.`,
          type: 'OPPORTUNITY',
          linkUrl: `/student/internships`
        }
      });
    }

    return res.status(201).json(created);
  } catch (error) {
    console.error('Create opportunity error:', error);
    return res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// 7. Admin: Trigger Provider Sync on Demand
opportunitiesRouter.post('/admin/opportunities/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const providerName = req.body?.provider as string;
    const syncService = OpportunitySyncService.getInstance();

    if (providerName) {
      const report = await syncService.syncSingleProvider(providerName);
      return res.json({ success: true, report });
    } else {
      const reports = await syncService.syncAllProviders();
      return res.json({ success: true, reports });
    }
  } catch (error: any) {
    console.error('Admin sync error:', error);
    return res.status(500).json({ error: error.message || 'Failed to trigger provider sync' });
  }
});

// 8. Admin: Get Provider Statuses & Recent Sync Logs
opportunitiesRouter.get('/admin/opportunities/sync-status', authenticate, async (_req: Request, res: Response) => {
  try {
    const registry = ProviderRegistryService.getInstance();
    const statuses = await registry.getProviderStatuses();

    const recentLogs = await prisma.opportunitySyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 15
    });

    const totalCount = await prisma.opportunity.count();
    const nativeCount = await prisma.opportunity.count({ where: { sourceType: 'NATIVE' } });
    const externalCount = await prisma.opportunity.count({ where: { sourceType: 'EXTERNAL' } });
    const expiredCount = await prisma.opportunity.count({ where: { status: 'EXPIRED' } });

    return res.json({
      providers: statuses,
      logs: recentLogs,
      summary: {
        total: totalCount,
        native: nativeCount,
        external: externalCount,
        expired: expiredCount
      }
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return res.status(500).json({ error: 'Failed to fetch provider sync status' });
  }
});
