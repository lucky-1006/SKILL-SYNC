import { ValidatedEnv } from './env.schema';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  apiPrefix: string;
  frontendUrl: string;
  corsOrigin: string;
  logLevel: string;
}

export const getAppConfig = (env: ValidatedEnv): AppConfig => ({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  frontendUrl: env.FRONTEND_URL,
  corsOrigin: env.CORS_ORIGIN,
  logLevel: env.LOG_LEVEL
});
