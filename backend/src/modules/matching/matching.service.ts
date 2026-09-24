import {
  ExplainableMatchScore,
  OpportunityRequirement,
  RecommendedLearningOpportunity
} from '@skillsync/shared';
import { configService } from '../../config';
import { prisma } from '../../lib/prisma';

export interface StudentMatchProfile {
  id: string;
  branch: string;
  currentYear: number;
  cgpa: number;
  skills: {
    skillId: string;
    skillName: string;
    score: number;
  }[];
  preferredLocation?: string;
  targetRoleTitle?: string;
}

export interface OpportunityMatchTarget {
  id: string;
  title: string;
  location: string;
  workMode: string;
  minCgpa: number;
  eligibleBranches: string[];
  eligibleYears: number[];
  requiredSkills: OpportunityRequirement[];
}

export class MatchingService {
  public static calculateMatch(
    student: StudentMatchProfile,
    opportunity: OpportunityMatchTarget
  ): ExplainableMatchScore {
    const weights = configService.opportunities.weights;
    const studentSkillMap = new Map<string, number>();
    student.skills.forEach((s) => {
      studentSkillMap.set(s.skillName.toLowerCase().trim(), s.score);
      if (s.skillId) studentSkillMap.set(s.skillId, s.score);
    });

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    let skillMatchSum = 0;
    const requirements = opportunity.requiredSkills || [];

    if (requirements.length === 0) {
      skillMatchSum = 85;
    } else {
      requirements.forEach((req) => {
        const studentScore =
          studentSkillMap.get(req.skillName.toLowerCase().trim()) ??
          (req.skillId ? studentSkillMap.get(req.skillId) : undefined) ??
          0;

        if (studentScore >= req.minScore) {
          matchedSkills.push(req.skillName);
          skillMatchSum += 1.0;
        } else if (studentScore > 0) {
          matchedSkills.push(`${req.skillName} (Needs Refinement)`);
          skillMatchSum += studentScore / req.minScore;
        } else {
          missingSkills.push(req.skillName);
          if (req.isMandatory) {
            skillMatchSum += 0;
          } else {
            skillMatchSum += 0.2; // partial tolerance for non-mandatory
          }
        }
      });
    }

    const skillMatchPercentage =
      requirements.length > 0
        ? Math.min(100, Math.round((skillMatchSum / requirements.length) * 100))
        : 85;

    // Eligibility calculations
    const branchEligible =
      opportunity.eligibleBranches.length === 0 ||
      opportunity.eligibleBranches.some((b) =>
        student.branch.toLowerCase().includes(b.toLowerCase()) || b === 'All' || b === 'All Disciplines'
      );

    const yearEligible =
      opportunity.eligibleYears.length === 0 ||
      opportunity.eligibleYears.includes(student.currentYear);

    const cgpaEligible = student.cgpa >= opportunity.minCgpa;

    const eligibilityMet = branchEligible && yearEligible && cgpaEligible;
    const eligibilityScore =
      (branchEligible ? 40 : 0) + (yearEligible ? 30 : 0) + (cgpaEligible ? 30 : 0);

    // Location & Work Mode
    let locationScore = 90;
    if (opportunity.workMode === 'REMOTE') {
      locationScore = 100;
    } else if (
      student.preferredLocation &&
      opportunity.location.toLowerCase().includes(student.preferredLocation.toLowerCase())
    ) {
      locationScore = 95;
    } else {
      locationScore = 75;
    }

    // Role / Interest affinity
    let interestScore = 80;
    if (
      student.targetRoleTitle &&
      (opportunity.title.toLowerCase().includes(student.targetRoleTitle.toLowerCase()) ||
        student.targetRoleTitle.toLowerCase().includes(opportunity.title.toLowerCase()))
    ) {
      interestScore = 98;
    }

    const experienceScore = Math.min(100, student.currentYear * 25);

    // Configurable Weighted Formula:
    // skillWeight * SkillMatch + eligibilityWeight * Eligibility + interestWeight * Interest + experienceWeight * Experience + locationWeight * Location
    const overallScore = Math.min(
      99,
      Math.max(
        35,
        Math.round(
          weights.skillWeight * skillMatchPercentage +
            weights.eligibilityWeight * eligibilityScore +
            weights.interestWeight * interestScore +
            weights.experienceWeight * experienceScore +
            weights.locationWeight * locationScore
        )
      )
    );

    // Human-friendly explainability
    let explanation = '';
    let recommendationReason = '';

    if (overallScore >= 85) {
      recommendationReason = `High Compatibility (${overallScore}%): Strong synergy between your verified skill proficiencies and role prerequisites.`;
      explanation = `You meet ${matchedSkills.length} required competencies with a strong CGPA of ${student.cgpa}. ${
        missingSkills.length > 0
          ? `Focus on sharpening [${missingSkills.join(', ')}] to guarantee selection.`
          : 'Ready for immediate shortlisting.'
      }`;
    } else if (overallScore >= 70) {
      recommendationReason = `Good Potential (${overallScore}%): Eligible candidate with addressable skill delta.`;
      explanation = `Eligible academic background. Missing or developing skills include [${missingSkills.join(
        ', '
      )}]. Completing targeted learning modules can boost your score by +15%.`;
    } else {
      recommendationReason = `Moderate Match (${overallScore}%): Additional preparation recommended prior to applying.`;
      explanation = `Significant skill gaps in [${missingSkills.join(
        ', '
      )}]. We recommend reviewing the role roadmap.`;
    }

    return {
      overallScore,
      breakdown: {
        skillMatchPercentage,
        eligibilityMet,
        branchEligible,
        cgpaEligible,
        locationScore
      },
      matchedSkills,
      missingSkills,
      explanation,
      recommendationReason
    };
  }

  /**
   * Find real courses/training programs in the platform addressing candidate's missing skills
   */
  public static async getLearningRecommendationsForGaps(
    missingSkills: string[]
  ): Promise<RecommendedLearningOpportunity[]> {
    if (missingSkills.length === 0) return [];

    try {
      // Find active courses, trainings, and workshops matching missing skill keywords
      const courses = await prisma.opportunity.findMany({
        where: {
          status: 'ACTIVE',
          type: { in: ['COURSE', 'TRAINING', 'WORKSHOP', 'LIVE_PROJECT'] }
        },
        take: 20
      });

      const recommendations: RecommendedLearningOpportunity[] = [];
      const seenIds = new Set<string>();

      for (const skillName of missingSkills) {
        const cleanSkill = skillName.toLowerCase().replace('(needs refinement)', '').trim();

        // Match against course title, description, or required skills
        const matchingCourse = courses.find((c) => {
          if (seenIds.has(c.id)) return false;
          const text = `${c.title} ${c.description} ${c.requiredSkillsJson || ''}`.toLowerCase();
          return text.includes(cleanSkill);
        });

        if (matchingCourse) {
          seenIds.add(matchingCourse.id);
          recommendations.push({
            id: matchingCourse.id,
            title: matchingCourse.title,
            provider: matchingCourse.companyName,
            type: matchingCourse.type as any,
            targetSkill: skillName,
            url: matchingCourse.applicationUrl || matchingCourse.sourceUrl || undefined,
            duration: matchingCourse.duration,
            level: 'Beginner to Intermediate'
          });
        } else {
          // Synthetic fallback recommended learning module for SIH curriculum
          recommendations.push({
            id: `rec-${cleanSkill.replace(/\s+/g, '-').toLowerCase()}`,
            title: `${skillName} Industry Foundation & Mastery`,
            provider: 'SkillSync National Learning Repository',
            type: 'COURSE',
            targetSkill: skillName,
            duration: '3 Weeks',
            level: 'Hands-on Lab'
          });
        }
      }

      return recommendations.slice(0, 4);
    } catch (error) {
      console.error('Failed to query learning recommendations for gaps:', error);
      return [];
    }
  }
}

