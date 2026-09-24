export interface ExternalOpportunityData {
  sourceId: string;
  source: string; // 'ADZUNA', 'UDEMY', etc.
  sourceType: 'EXTERNAL';
  title: string;
  companyName: string;
  companyLogo?: string;
  type: string; // 'JOB', 'INTERNSHIP', 'COURSE', 'TRAINING'
  description: string;
  location: string;
  country?: string;
  state?: string;
  city?: string;
  remote: boolean;
  hybrid: boolean;
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  employmentType?: string;
  stipendOrSalary: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  duration: string;
  openings: number;
  deadline?: string;
  expiresAt?: Date;
  applicationUrl: string;
  sourceUrl: string;
  rawSkills: string[];
  educationRequirements?: string;
  experienceRequirements?: string;
  category?: string;
  publishedAt?: Date;
  metadata?: Record<string, any>;
}

export interface ProviderSearchParams {
  query?: string;
  location?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface OpportunityProvider {
  readonly name: string;
  readonly supportedType: 'JOB' | 'INTERNSHIP' | 'COURSE' | 'TRAINING';
  isConfigured(): boolean;
  search(params: ProviderSearchParams): Promise<ExternalOpportunityData[]>;
  fetchDetails(id: string): Promise<ExternalOpportunityData | null>;
}

export interface ProviderStatus {
  name: string;
  type: string;
  enabled: boolean;
  configured: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  recordsCount?: number;
}
