import { SkillCategory } from './skills';

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Question {
  id: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  text: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  points: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  skillIds: string[];
  durationMinutes: number;
  passingScore: number;
  totalQuestions: number;
  questions?: Question[];
}

export interface AssessmentAttemptSubmission {
  assessmentId: string;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
  }[];
  timeSpentSeconds: number;
}

export interface AssessmentResult {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  category: SkillCategory;
  scorePercentage: number;
  passed: boolean;
  totalCorrect: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  skillScoreDeltas: {
    skillId: string;
    skillName: string;
    newScore: number;
    improvedBy: number;
  }[];
  feedback: string;
}
