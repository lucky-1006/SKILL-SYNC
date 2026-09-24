import { ValidatedEnv } from './env.schema';

export interface SearchConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  searxngUrl?: string;
}

export const getSearchConfig = (env: ValidatedEnv): SearchConfig => ({
  provider: env.SEARCH_PROVIDER,
  apiKey: env.SEARCH_API_KEY,
  baseUrl: env.SEARCH_BASE_URL,
  searxngUrl: env.SEARXNG_URL
});
