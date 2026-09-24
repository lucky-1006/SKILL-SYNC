import { ValidatedEnv } from './env.schema';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  oauth: {
    google?: {
      clientId?: string;
      clientSecret?: string;
      callbackUrl?: string;
    };
    github?: {
      clientId?: string;
      clientSecret?: string;
      callbackUrl?: string;
    };
  };
  security: {
    encryptionKey: string;
    sessionSecret: string;
  };
}

export const getAuthConfig = (env: ValidatedEnv): AuthConfig => ({
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET || 'skillsync-default-refresh-secret-2026',
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  oauth: {
    google: env.GOOGLE_CLIENT_ID
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackUrl: env.GOOGLE_CALLBACK_URL
        }
      : undefined,
    github: env.GITHUB_CLIENT_ID
      ? {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackUrl: env.GITHUB_CALLBACK_URL
        }
      : undefined
  },
  security: {
    encryptionKey: env.ENCRYPTION_KEY,
    sessionSecret: env.SESSION_SECRET
  }
});
