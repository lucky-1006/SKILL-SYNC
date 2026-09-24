import { ValidatedEnv } from './env.schema';

export interface OpportunityProviderConfig {
  adzuna: {
    enabled: boolean;
    appId?: string;
    appKey?: string;
    country: string;
  };
  udemy: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
  };
  sync: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

export interface MatchingWeightsConfig {
  skillWeight: number;       // Default: 0.45 (45%)
  eligibilityWeight: number; // Default: 0.20 (20%)
  interestWeight: number;    // Default: 0.15 (15%)
  experienceWeight: number;  // Default: 0.10 (10%)
  locationWeight: number;    // Default: 0.10 (10%)
}

export interface OpportunitiesConfig {
  providers: OpportunityProviderConfig;
  weights: MatchingWeightsConfig;
}

export const MATCHING_WEIGHTS: MatchingWeightsConfig = {
  skillWeight: 0.45,
  eligibilityWeight: 0.20,
  interestWeight: 0.15,
  experienceWeight: 0.10,
  locationWeight: 0.10
};

export const getOpportunitiesConfig = (env: ValidatedEnv): OpportunitiesConfig => ({
  providers: {
    adzuna: {
      enabled: env.ADZUNA_ENABLED,
      appId: env.ADZUNA_APP_ID,
      appKey: env.ADZUNA_APP_KEY,
      country: env.ADZUNA_COUNTRY || 'in'
    },
    udemy: {
      enabled: env.UDEMY_ENABLED,
      clientId: env.UDEMY_CLIENT_ID,
      clientSecret: env.UDEMY_CLIENT_SECRET
    },
    sync: {
      enabled: env.OPPORTUNITY_SYNC_ENABLED,
      intervalMinutes: env.OPPORTUNITY_SYNC_INTERVAL_MINUTES || 60
    }
  },
  weights: MATCHING_WEIGHTS
});
