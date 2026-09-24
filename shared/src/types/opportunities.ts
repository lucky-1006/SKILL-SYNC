import { SkillCategory } from './skills';

export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  JOB = 'JOB',
  COURSE = 'COURSE',
  TRAINING = 'TRAINING',
  WORKSHOP = 'WORKSHOP',
  FDP = 'FDP',
  FACULTY_INTERNSHIP = 'FACULTY_INTERNSHIP',
  CONSULTANCY = 'CONSULTANCY',
  RESEARCH_PROJECT = 'RESEARCH_PROJECT',
  INNOVATION_CHALLENGE = 'INNOVATION_CHALLENGE',
  LIVE_PROJECT = 'LIVE_PROJECT',
  MENTORSHIP = 'MENTORSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP'
}

export enum OpportunitySourceType {
  NATIVE = 'NATIVE',
  EXTERNAL = 'EXTERNAL'
}

export enum OpportunityStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT'
}

export enum OpportunityApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum WorkMode {
  REMOTE = 'REMOTE',
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID'
}

export interface OpportunityRequirement {
  skillId: string;
  skillName: string;
  minScore: number;
  isMandatory: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  sourceType?: OpportunitySourceType;
  source?: string; // 'INTERNAL', 'ADZUNA', 'UDEMY', etc.
  sourceId?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  country?: string;
  state?: string;
  city?: string;
  remote?: boolean;
  hybrid?: boolean;
  workMode: WorkMode;
  employmentType?: string;
  description: string;
  stipendOrSalary: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  duration: string;
  openings: number;
  eligibleBranches: string[];
  eligibleYears: number[];
  minCgpa: number;
  deadline: string;
  expiresAt?: string;
  requiredSkills: OpportunityRequirement[];
  preferredSkills?: string[];
  normalizedSkills?: string[];
  educationRequirements?: string;
  experienceRequirements?: string;
  category?: string;
  status?: OpportunityStatus;
  approvalStatus?: OpportunityApprovalStatus;
  createdAt: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  metadata?: Record<string, any>;
  isSaved?: boolean;
}

export interface ExplainableMatchScore {
  overallScore: number; // 0-100%
  breakdown: {
    skillMatchPercentage: number;
    eligibilityMet: boolean;
    branchEligible: boolean;
    cgpaEligible: boolean;
    locationScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  recommendationReason: string;
  recommendedLearning?: RecommendedLearningOpportunity[];
}

export interface RecommendedLearningOpportunity {
  id: string;
  title: string;
  provider: string;
  type: 'COURSE' | 'TRAINING' | 'WORKSHOP' | 'PROJECT';
  targetSkill: string;
  url?: string;
  duration?: string;
  level?: string;
}

export interface OpportunityWithMatch extends Opportunity {
  matchScore: ExplainableMatchScore;
}

export interface OpportunityFilterParams {
  type?: string;
  sourceType?: OpportunitySourceType | 'ALL';
  workMode?: string;
  location?: string;
  search?: string;
  skill?: string;
  category?: string;
  minMatchScore?: number;
  savedOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'matchScore' | 'createdAt' | 'deadline';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOpportunitiesResponse {
  data: OpportunityWithMatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

