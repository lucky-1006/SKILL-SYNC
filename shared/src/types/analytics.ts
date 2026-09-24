export interface DepartmentReadinessMetric {
  department: string;
  totalStudents: number;
  assessedStudents: number;
  avgReadinessScore: number;
  internshipParticipationRate: number;
  placementRate: number;
}

export interface SkillGapMetric {
  skillName: string;
  category: string;
  studentAverageScore: number;
  industryBenchmark: number;
  percentageGap: number;
  affectedStudentsCount: number;
}

export interface IndustryDemandTrend {
  skillName: string;
  category: string;
  demandPercentage: number; // e.g. 82% of job postings require this
  growthQuarterOverQuarter: number; // e.g. +14%
  primaryRoles: string[];
}

export interface InstitutionDashboardAnalytics {
  institutionId: string;
  institutionName: string;
  summary: {
    totalStudents: number;
    skillAssessedCount: number;
    assessmentRatePercentage: number;
    internshipsSecured: number;
    placedStudents: number;
    overallPlacementRatePercentage: number;
    industryPartnershipsCount: number;
  };
  departmentReadiness: DepartmentReadinessMetric[];
  mostCommonSkillGaps: SkillGapMetric[];
  inDemandIndustrySkills: IndustryDemandTrend[];
  monthlyPlacementFunnel: {
    month: string;
    applications: number;
    shortlisted: number;
    interviews: number;
    offers: number;
  }[];
}

export interface IndustryDashboardAnalytics {
  industryId: string;
  companyName: string;
  totalPostings: number;
  activeInterns: number;
  totalApplicants: number;
  averageCandidateMatchScore: number;
  topSkillsInApplicantPool: {
    skill: string;
    averageScore: number;
  }[];
  conversionRates: {
    stage: string;
    count: number;
  }[];
}
