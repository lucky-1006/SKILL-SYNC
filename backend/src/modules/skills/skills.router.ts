import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';
import { SkillGapService, RequiredSkillBenchmark } from './skill-gap.service';
import { AssessmentAttemptSubmission, AssessmentResult, SkillCategory } from '@skillsync/shared';

export const skillsRouter = Router();

// 1. Get all skills master list
skillsRouter.get('/skills', async (_req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { inDemandScore: 'desc' }
    });
    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// 2. Get Student's Skill Profile
skillsRouter.get('/skills/student', authenticate, async (req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst({
      include: {
        skillScores: {
          include: { skill: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const formattedScores = student.skillScores.map((s) => ({
      skillId: s.skillId,
      skillName: s.skill.name,
      category: s.skill.category as SkillCategory,
      score: s.score,
      verified: s.verified,
      verificationStatus: s.verificationStatus,
      verifiedBy: s.verifiedBy,
      verifiedAt: s.verifiedAt?.toISOString()
    }));

    // Categorized breakdown
    const technicalSkills = formattedScores.filter(
      (s) => s.category !== SkillCategory.SOFT_SKILLS && s.category !== SkillCategory.APTITUDE
    );
    const softSkills = formattedScores.filter((s) => s.category === SkillCategory.SOFT_SKILLS);
    const aptitudeSkills = formattedScores.filter((s) => s.category === SkillCategory.APTITUDE);

    const avgScore =
      formattedScores.length > 0
        ? Math.round(
            formattedScores.reduce((acc, curr) => acc + curr.score, 0) / formattedScores.length
          )
        : 70;

    return res.json({
      studentId: student.id,
      overallReadinessScore: student.readinessScore || avgScore,
      headline: student.headline,
      skills: formattedScores,
      breakdown: {
        technical: technicalSkills,
        softSkills: softSkills,
        aptitude: aptitudeSkills
      }
    });
  } catch (error) {
    console.error('Error fetching student skills:', error);
    return res.status(500).json({ error: 'Failed to fetch student skill profile' });
  }
});

// 3. Get all assessments
skillsRouter.get('/skills/assessments', async (_req: Request, res: Response) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        _count: { select: { questions: true } }
      }
    });

    return res.json(
      assessments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        durationMinutes: a.durationMinutes,
        passingScore: a.passingScore,
        totalQuestions: a._count.questions
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// 4. Get specific assessment with questions for test taking
skillsRouter.get('/skills/assessments/:id', async (req: Request, res: Response) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: { skill: true }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const formattedQuestions = assessment.questions.map((q) => ({
      id: q.id,
      skillId: q.skillId,
      skillName: q.skill.name,
      category: q.skill.category,
      text: q.text,
      codeSnippet: q.codeSnippet,
      options: JSON.parse(q.optionsJson),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points
    }));

    return res.json({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      durationMinutes: assessment.durationMinutes,
      passingScore: assessment.passingScore,
      totalQuestions: formattedQuestions.length,
      questions: formattedQuestions
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assessment details' });
  }
});

// 5. Submit Assessment & Auto-grade
skillsRouter.post(
  '/skills/assessments/:id/submit',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const submission: AssessmentAttemptSubmission = req.body;
      const assessment = await prisma.assessment.findUnique({
        where: { id: req.params.id },
        include: {
          questions: {
            include: { skill: true }
          }
        }
      });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const student = await prisma.studentProfile.findFirst();
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      let totalPointsEarned = 0;
      let maxPoints = 0;
      let totalCorrect = 0;

      const answerMap = new Map<string, number>();
      submission.answers.forEach((a) => answerMap.set(a.questionId, a.selectedOptionIndex));

      const affectedSkills = new Map<string, { skillName: string; correct: number; total: number }>();

      assessment.questions.forEach((q) => {
        maxPoints += q.points;
        const selected = answerMap.get(q.id);
        const isCorrect = selected === q.correctOptionIndex;

        if (isCorrect) {
          totalPointsEarned += q.points;
          totalCorrect++;
        }

        const curr = affectedSkills.get(q.skillId) || {
          skillName: q.skill.name,
          correct: 0,
          total: 0
        };
        curr.total++;
        if (isCorrect) curr.correct++;
        affectedSkills.set(q.skillId, curr);
      });

      const scorePercentage =
        maxPoints > 0 ? Math.round((totalPointsEarned / maxPoints) * 100) : 0;
      const passed = scorePercentage >= assessment.passingScore;

      // Update student skills scores with improvement deltas
      const skillScoreDeltas: AssessmentResult['skillScoreDeltas'] = [];

      for (const [skillId, stats] of affectedSkills.entries()) {
        const accuracy = stats.correct / stats.total;
        const existing = await prisma.studentSkillScore.findUnique({
          where: {
            studentId_skillId: {
              studentId: student.id,
              skillId
            }
          }
        });

        const currentScore = existing ? existing.score : 50;
        // Adaptive moving average update
        const performanceBonus = Math.round((accuracy - 0.5) * 20);
        const newScore = Math.min(99, Math.max(20, currentScore + performanceBonus));
        const improvedBy = newScore - currentScore;

        await prisma.studentSkillScore.upsert({
          where: {
            studentId_skillId: {
              studentId: student.id,
              skillId
            }
          },
          update: {
            score: newScore,
            verified: passed ? true : existing?.verified ?? false,
            verificationStatus: passed ? 'VERIFIED_BY_ASSESSMENT' : existing?.verificationStatus ?? 'UNVERIFIED',
            verifiedBy: passed ? 'SkillSync Automatic Evaluation Engine' : existing?.verifiedBy,
            verifiedAt: passed ? new Date() : existing?.verifiedAt
          },
          create: {
            studentId: student.id,
            skillId,
            score: newScore,
            verified: passed,
            verificationStatus: passed ? 'VERIFIED_BY_ASSESSMENT' : 'UNVERIFIED',
            verifiedBy: passed ? 'SkillSync Automatic Evaluation Engine' : null,
            verifiedAt: passed ? new Date() : null
          }
        });

        skillScoreDeltas.push({
          skillId,
          skillName: stats.skillName,
          newScore,
          improvedBy
        });
      }

      // Record attempt
      const attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentId: assessment.id,
          studentId: student.id,
          scorePercentage,
          passed,
          totalCorrect,
          totalQuestions: assessment.questions.length,
          timeSpentSeconds: submission.timeSpentSeconds || 300,
          feedback: passed
            ? `Demonstrated solid competency. Scored ${scorePercentage}%. Verified badges updated.`
            : `Scored ${scorePercentage}% (Passing threshold: ${assessment.passingScore}%). Review suggested modules.`
        }
      });

      const result: AssessmentResult = {
        attemptId: attempt.id,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        category: assessment.category as SkillCategory,
        scorePercentage,
        passed,
        totalCorrect,
        totalQuestions: assessment.questions.length,
        timeSpentSeconds: submission.timeSpentSeconds || 300,
        skillScoreDeltas,
        feedback: attempt.feedback || ''
      };

      return res.json(result);
    } catch (error) {
      console.error('Submit assessment error:', error);
      return res.status(500).json({ error: 'Failed to submit assessment' });
    }
  }
);

// 6. Skill Gap Analysis vs Target Role
skillsRouter.get('/skills/gap-analysis', authenticate, async (req: Request, res: Response) => {
  try {
    const roleId = req.query.roleId as string;
    let targetRole = null;

    if (roleId) {
      targetRole = await prisma.careerRole.findUnique({ where: { id: roleId } });
    }

    if (!targetRole) {
      // Default to AI & Machine Learning Engineer benchmark
      targetRole = await prisma.careerRole.findFirst({
        where: { title: { contains: 'AI & Machine Learning' } }
      });
    }

    if (!targetRole) {
      return res.status(404).json({ error: 'Career role benchmark not found' });
    }

    const student = await prisma.studentProfile.findFirst({
      include: {
        skillScores: {
          include: { skill: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const studentSkills = student.skillScores.map((s) => ({
      skillId: s.skillId,
      skillName: s.skill.name,
      score: s.score
    }));

    const requiredSkills: RequiredSkillBenchmark[] = JSON.parse(targetRole.requiredSkillsJson);

    const gapReport = SkillGapService.calculateGaps(studentSkills, requiredSkills);

    return res.json({
      targetRole: {
        id: targetRole.id,
        title: targetRole.title,
        domain: targetRole.domain,
        description: targetRole.description,
        avgSalary: targetRole.avgSalary,
        industryDemandPercentage: targetRole.industryDemandPercentage
      },
      ...gapReport
    });
  } catch (error) {
    console.error('Gap analysis error:', error);
    return res.status(500).json({ error: 'Failed to compute skill gap analysis' });
  }
});
