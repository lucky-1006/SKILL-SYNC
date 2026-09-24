import { ValidatedEnv } from './env.schema';

export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  vectorDatabaseUrl: string;
  vectorTable: string;
}

export const getDatabaseConfig = (env: ValidatedEnv): DatabaseConfig => ({
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_DATABASE_URL,
  vectorDatabaseUrl: env.VECTOR_DATABASE_URL || env.DATABASE_URL,
  vectorTable: env.VECTOR_TABLE
});
