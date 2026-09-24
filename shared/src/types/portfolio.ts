import { StudentSkillScore } from './skills';

export interface VerifiedProject {
  id: string;
  title: string;
  description: string;
  skillsUsed: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  verifiedByMentor?: boolean;
  mentorComments?: string;
}

export interface VerifiedCertificate {
  id: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl?: string;
  verificationCode: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedBy: string; // Institution or Industry partner
}

export interface DigitalStudentPortfolio {
  studentId: string;
  fullName: string;
  headline: string;
  institutionName: string;
  branch: string;
  currentYear: number;
  cgpa: number;
  readinessScore: number; // 0-100
  bio: string;
  skills: StudentSkillScore[];
  projects: VerifiedProject[];
  certificates: VerifiedCertificate[];
  completedInternships: {
    title: string;
    company: string;
    duration: string;
    performanceRating: number;
    mentorRecommendation: string;
  }[];
  honorsAndAchievements: string[];
  publicShareableUrl: string;
}
