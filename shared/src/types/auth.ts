export enum UserRole {
  STUDENT = 'STUDENT',
  ACADEMICIAN = 'ACADEMICIAN',
  INDUSTRY = 'INDUSTRY',
  INSTITUTION = 'INSTITUTION',
  ADMIN = 'ADMIN'
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  institutionId?: string;
  industryId?: string;
}

export interface AuthResponse {
  token: string;
  user: UserSession;
}
