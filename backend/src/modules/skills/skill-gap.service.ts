import { SkillGapItem, SkillCategory } from '@skillsync/shared';

export interface RequiredSkillBenchmark {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  requiredScore: number;
  weight: number;
}

export class SkillGapService {
  public static calculateGaps(
    studentSkills: { skillId: string; skillName: string; score: number }[],
    requiredSkills: RequiredSkillBenchmark[]
  ): {
    overallReadinessPercentage: number;
    gaps: SkillGapItem[];
    criticalGapsCount: number;
    topPriorities: string[];
  } {
    const studentMap = new Map<string, number>();
    studentSkills.forEach((s) => {
      studentMap.set(s.skillName.toLowerCase().trim(), s.score);
      studentMap.set(s.skillId, s.score);
    });

    const gaps: SkillGapItem[] = [];
    let totalWeightedScore = 0;
    let totalWeights = 0;

    requiredSkills.forEach((req) => {
      const studentScore =
        studentMap.get(req.skillName.toLowerCase().trim()) ??
        studentMap.get(req.skillId) ??
        0;

      const gap = Math.max(0, req.requiredScore - studentScore);
      let status: 'MET' | 'MINOR_GAP' | 'CRITICAL_GAP' = 'MET';
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let recommendedAction = 'Maintain current competency through periodic practice.';

      if (gap > 25) {
        status = 'CRITICAL_GAP';
        priority = 'HIGH';
        recommendedAction = `Enroll in intensive foundation & hands-on laboratory modules for ${req.skillName}.`;
      } else if (gap > 5) {
        status = 'MINOR_GAP';
        priority = 'MEDIUM';
        recommendedAction = `Targeted project work and assessment refresher to bridge the ${gap}% gap.`;
      }

      const weight = req.weight || 1;
      const effectiveRatio = Math.min(1.0, studentScore / req.requiredScore);
      totalWeightedScore += effectiveRatio * weight * 100;
      totalWeights += weight;

      gaps.push({
        skillId: req.skillId,
        skillName: req.skillName,
        category: req.category,
        studentScore,
        requiredScore: req.requiredScore,
        gap,
        status,
        priority,
        recommendedAction
      });
    });

    const overallReadinessPercentage =
      totalWeights > 0 ? Math.round(totalWeightedScore / totalWeights) : 70;

    // Sort gaps by priority & magnitude
    gaps.sort((a, b) => b.gap - a.gap);

    const criticalGapsCount = gaps.filter((g) => g.status === 'CRITICAL_GAP').length;
    const topPriorities = gaps
      .filter((g) => g.gap > 0)
      .slice(0, 3)
      .map((g) => g.skillName);

    return {
      overallReadinessPercentage,
      gaps,
      criticalGapsCount,
      topPriorities
    };
  }
}
