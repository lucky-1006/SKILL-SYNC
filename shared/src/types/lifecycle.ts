import { OpportunityType } from './opportunities';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  SELECTED = 'SELECTED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ACTIVE_INTERNSHIP = 'ACTIVE_INTERNSHIP',
  COMPLETED = 'COMPLETED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED'
}

export interface ApplicationItem {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: OpportunityType;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantRole: 'STUDENT' | 'ACADEMICIAN';
  applicantBranch?: string;
  applicantCgpa?: number;
  status: ApplicationStatus;
  matchPercentage: number;
  appliedDate: string;
  interviewDate?: string;
  interviewMeetingLink?: string;
  notes?: string;
  feedback?: string;
}

export interface InternshipTask {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  assignedBy: string; // Mentor name
  assignedTo: string; // Student name
  dueDate: string;
  status: TaskStatus;
  deliverableUrl?: string;
  studentNotes?: string;
  mentorFeedback?: string;
  grade?: string;
}

export interface WeeklyProgressReport {
  id: string;
  workspaceId: string;
  weekNumber: number;
  hoursWorked: number;
  summary: string;
  keyLearnings: string[];
  blockers?: string;
  submittedAt: string;
  mentorStatus: 'PENDING' | 'APPROVED' | 'FEEDBACK_PROVIDED';
  mentorComments?: string;
}

export interface InternshipWorkspace {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  mentorName: string;
  mentorEmail: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED';
  tasks: InternshipTask[];
  weeklyReports: WeeklyProgressReport[];
  attendanceRate: number; // 0-100%
  finalEvaluation?: {
    technicalScore: number;
    softSkillScore: number;
    initiativeScore: number;
    overallFeedback: string;
    certificateIssued: boolean;
    certificateId?: string;
  };
}
