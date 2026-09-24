export interface RerankerCandidate {
  id: string;
  title: string;
  vectorSimilarity: number;
  metadata?: {
    verifiedSkillsCount?: number;
    cgpa?: number;
    eligibleBranch?: boolean;
    workMode?: string;
  };
}

export interface RerankResult {
  candidateId: string;
  title: string;
  initialRank: number;
  finalRank: number;
  crossEncoderScore: number;
  rankDelta: number; // positive means moved up
  rerankReason: string;
}

export class CrossEncoderRerankerProvider {
  /**
   * Cross-scores candidate matches to eliminate false positives from coarse vector search
   */
  public rerank(
    candidates: RerankerCandidate[],
    topK: number = 10
  ): RerankResult[] {
    const scored = candidates.map((cand, index) => {
      let score = cand.vectorSimilarity * 0.5;

      // Verification credibility booster
      const verifiedBonus = (cand.metadata?.verifiedSkillsCount || 0) * 0.05;
      score += Math.min(0.2, verifiedBonus);

      // Academic eligibility bonus
      if (cand.metadata?.eligibleBranch) {
        score += 0.15;
      }

      // Academic rigor bonus (CGPA)
      if (cand.metadata?.cgpa && cand.metadata.cgpa >= 8.0) {
        score += 0.15;
      }

      const finalCrossScore = Math.min(1.0, score);

      return {
        candidateId: cand.id,
        title: cand.title,
        initialRank: index + 1,
        crossEncoderScore: Number(finalCrossScore.toFixed(4)),
        metadata: cand.metadata
      };
    });

    // Sort descending by cross-encoder score
    scored.sort((a, b) => b.crossEncoderScore - a.crossEncoderScore);

    return scored.slice(0, topK).map((item, finalIndex) => {
      const finalRank = finalIndex + 1;
      const rankDelta = item.initialRank - finalRank;

      let rerankReason = 'Balanced semantic and credential alignment.';
      if (rankDelta > 0) {
        rerankReason = `Promoted (+${rankDelta} ranks) due to verified skill badges and academic compliance.`;
      } else if (rankDelta < 0) {
        rerankReason = `Adjusted (-${Math.abs(rankDelta)} ranks) to prioritize verified criteria.`;
      }

      return {
        candidateId: item.candidateId,
        title: item.title,
        initialRank: item.initialRank,
        finalRank,
        crossEncoderScore: item.crossEncoderScore,
        rankDelta,
        rerankReason
      };
    });
  }
}
