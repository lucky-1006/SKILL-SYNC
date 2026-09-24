export enum SkillCategory {
  PROGRAMMING = 'PROGRAMMING',
  DATA_SCIENCE = 'DATA_SCIENCE',
  AI_ML = 'AI_ML',
  CLOUD_DEVOPS = 'CLOUD_DEVOPS',
  CYBERSECURITY = 'CYBERSECURITY',
  WEB_MOBILE = 'WEB_MOBILE',
  AYUSH_HEALTH_TECH = 'AYUSH_HEALTH_TECH',
  SOFT_SKILLS = 'SOFT_SKILLS',
  APTITUDE = 'APTITUDE'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED_BY_INSTITUTION = 'VERIFIED_BY_INSTITUTION',
  VERIFIED_BY_INDUSTRY = 'VERIFIED_BY_INDUSTRY',
  VERIFIED_BY_ASSESSMENT = 'VERIFIED_BY_ASSESSMENT'
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  inDemandScore?: number; // 0-100
}

export interface StudentSkillScore {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  score: number; // 0-100
  verified: boolean;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  studentScore: number;
  requiredScore: number;
  gap: number; // required - current (positive means shortfall)
  status: 'MET' | 'MINOR_GAP' | 'CRITICAL_GAP';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction?: string;
}

export interface CareerRoleBenchmark {
  id: string;
  title: string;
  domain: string;
  description: string;
  avgSalary: string;
  industryDemandPercentage: number;
  requiredSkills: {
    skillId: string;
    skillName: string;
    category: SkillCategory;
    requiredScore: number;
    weight: number;
  }[];
}

export interface CareerRoadmapMonth {
  monthNumber: number;
  title: string;
  focusArea: string;
  skillsToAcquire: string[];
  recommendedCourses: {
    title: string;
    provider: string;
    url?: string;
    duration: string;
  }[];
  practicalProject: {
    title: string;
    description: string;
    deliverables: string[];
  };
  milestoneAssessment: string;
}

export interface CareerRoadmap {
  roleId: string;
  roleTitle: string;
  overallReadinessScore: number;
  months: CareerRoadmapMonth[];
}
