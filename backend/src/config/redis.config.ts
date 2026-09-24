import { ValidatedEnv } from './env.schema';

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password?: string;
  queueRedisUrl: string;
}

export const getRedisConfig = (env: ValidatedEnv): RedisConfig => ({
  url: env.REDIS_URL,
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  queueRedisUrl: env.QUEUE_REDIS_URL || env.REDIS_URL
});
