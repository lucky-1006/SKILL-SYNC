import { ValidatedEnv } from './env.schema';

export interface EmailConfig {
  provider: 'console' | 'smtp' | 'sendgrid';
  smtp?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
  };
  from: string;
  notificationsEnabled: boolean;
}

export const getEmailConfig = (env: ValidatedEnv): EmailConfig => ({
  provider: env.EMAIL_PROVIDER,
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD
  },
  from: env.EMAIL_FROM,
  notificationsEnabled: env.NOTIFICATION_ENABLED
});
