export enum CollaborationType {
  MENTORSHIP = 'MENTORSHIP',
  GUEST_LECTURE = 'GUEST_LECTURE',
  LIVE_INDUSTRY_PROJECT = 'LIVE_INDUSTRY_PROJECT',
  INNOVATION_CHALLENGE = 'INNOVATION_CHALLENGE',
  RESEARCH_COLLABORATION = 'RESEARCH_COLLABORATION'
}

export interface MentorshipSlot {
  id: string;
  mentorName: string;
  mentorTitle: string;
  companyName: string;
  expertiseAreas: string[];
  availableSlots: string[];
  maxMentees: number;
  currentMenteesCount: number;
  bio: string;
}

export interface InnovationChallenge {
  id: string;
  title: string;
  industryName: string;
  problemStatement: string;
  domain: string;
  prizePool: string;
  submissionDeadline: string;
  evaluationCriteria: string[];
  registeredTeamsCount: number;
}

export interface ResearchCollaborationProposal {
  id: string;
  title: string;
  leadFacultyName: string;
  institutionName: string;
  partnerIndustryName: string;
  focusArea: string;
  objectives: string[];
  fundingExpected: string;
  durationMonths: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_EVALUATION' | 'APPROVED' | 'IN_PROGRESS';
}
