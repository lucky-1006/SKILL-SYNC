import { ValidatedEnv } from './env.schema';

export interface StorageConfig {
  provider: 'local' | 's3';
  s3: {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKey?: string;
    secretKey?: string;
  };
}

export const getStorageConfig = (env: ValidatedEnv): StorageConfig => ({
  provider: env.STORAGE_PROVIDER,
  s3: {
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION || 'ap-south-1',
    bucket: env.S3_BUCKET || 'skillsync-resumes',
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY
  }
});
