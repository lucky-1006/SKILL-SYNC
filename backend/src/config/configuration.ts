import dotenv from 'dotenv';
import path from 'path';
import { envSchema, ValidatedEnv } from './env.schema';
import { AppConfig, getAppConfig } from './app.config';
import { DatabaseConfig, getDatabaseConfig } from './database.config';
import { AuthConfig, getAuthConfig } from './auth.config';
import { AIConfig, getAIConfig } from './ai.config';
import { StorageConfig, getStorageConfig } from './storage.config';
import { RedisConfig, getRedisConfig } from './redis.config';
import { EmailConfig, getEmailConfig } from './email.config';
import { SearchConfig, getSearchConfig } from './search.config';
import { OpportunitiesConfig, getOpportunitiesConfig } from './opportunities.config';

export interface FullConfiguration {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  ai: AIConfig;
  storage: StorageConfig;
  redis: RedisConfig;
  email: EmailConfig;
  search: SearchConfig;
  opportunities: OpportunitiesConfig;
}

export class ConfigService {
  private static instance: ConfigService;
  private readonly rawEnv: ValidatedEnv;
  public readonly app: AppConfig;
  public readonly database: DatabaseConfig;
  public readonly auth: AuthConfig;
  public readonly ai: AIConfig;
  public readonly storage: StorageConfig;
  public readonly redis: RedisConfig;
  public readonly email: EmailConfig;
  public readonly search: SearchConfig;
  public readonly opportunities: OpportunitiesConfig;


  private constructor() {
    // 1. Load environment variables from backend/.env or root .env
    const rootEnvPath = path.resolve(process.cwd(), '../.env');
    const localEnvPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: rootEnvPath });
    dotenv.config({ path: localEnvPath, override: true });

    // 2. Validate with Zod schema
    const parseResult = envSchema.safeParse(process.env);

    if (!parseResult.success) {
      console.error('\n=============================================================');
      console.error('❌ [ConfigService] CRITICAL ENVIRONMENT CONFIGURATION ERROR');
      console.error('=============================================================');
      console.error('The application failed to start because required environment variables');
      console.error('are missing or invalid in your .env configuration:\n');

      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path.join('.');
        console.error(`  • [${fieldName}]: ${issue.message}`);
      });

      console.error('\nPlease copy backend/.env.example to backend/.env and provide');
      console.error('the required credentials.\n');
      console.error('=============================================================\n');

      process.exit(1);
    }

    this.rawEnv = parseResult.data;

    // 3. Assemble modular domain configurations
    this.app = getAppConfig(this.rawEnv);
    this.database = getDatabaseConfig(this.rawEnv);
    this.auth = getAuthConfig(this.rawEnv);
    this.ai = getAIConfig(this.rawEnv);
    this.storage = getStorageConfig(this.rawEnv);
    this.redis = getRedisConfig(this.rawEnv);
    this.email = getEmailConfig(this.rawEnv);
    this.search = getSearchConfig(this.rawEnv);
    this.opportunities = getOpportunitiesConfig(this.rawEnv);
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Generic dot-path getter matching the NestJS ConfigService API pattern
   * Example: configService.get<string>('ai.provider')
   */
  public get<T = any>(pathStr: string): T {
    const parts = pathStr.split('.');
    let current: any = {
      app: this.app,
      database: this.database,
      auth: this.auth,
      ai: this.ai,
      storage: this.storage,
      redis: this.redis,
      email: this.email,
      search: this.search,
      opportunities: this.opportunities,
      env: this.rawEnv
    };

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined as unknown as T;
      }
      current = current[part];
    }

    return current as T;
  }

  /**
   * Returns a sanitized copy of configuration safe for logging/telemetry
   * (Masks all secrets, passwords, and private API keys)
   */
  public getSanitizedConfig(): Record<string, any> {
    return {
      environment: this.app.nodeEnv,
      port: this.app.port,
      apiPrefix: this.app.apiPrefix,
      frontendUrl: this.app.frontendUrl,
      corsOrigin: this.app.corsOrigin,
      database: {
        provider: this.database.url.startsWith('file:') ? 'sqlite' : 'postgresql',
        vectorTable: this.database.vectorTable
      },
      ai: {
        provider: this.ai.provider,
        llmModel: this.ai.llmModel,
        embeddingProvider: this.ai.embeddings.provider,
        embeddingModel: this.ai.embeddings.model,
        embeddingDimensions: this.ai.embeddings.dimensions,
        rerankerProvider: this.ai.reranker.provider,
        hasGroqKey: Boolean(this.ai.keys.groq),
        hasOpenAIKey: Boolean(this.ai.keys.openai),
        hasGeminiKey: Boolean(this.ai.keys.gemini),
        hasAnthropicKey: Boolean(this.ai.keys.anthropic)
      },
      opportunities: {
        adzunaEnabled: this.opportunities.providers.adzuna.enabled,
        hasAdzunaAppId: Boolean(this.opportunities.providers.adzuna.appId),
        hasAdzunaAppKey: Boolean(this.opportunities.providers.adzuna.appKey),
        adzunaCountry: this.opportunities.providers.adzuna.country,
        udemyEnabled: this.opportunities.providers.udemy.enabled,
        hasUdemyClientId: Boolean(this.opportunities.providers.udemy.clientId),
        hasUdemyClientSecret: Boolean(this.opportunities.providers.udemy.clientSecret),
        syncEnabled: this.opportunities.providers.sync.enabled,
        syncIntervalMinutes: this.opportunities.providers.sync.intervalMinutes,
        weights: this.opportunities.weights
      },
      storage: {
        provider: this.storage.provider,
        bucket: this.storage.s3.bucket,
        region: this.storage.s3.region
      },
      redis: {
        host: this.redis.host,
        port: this.redis.port
      },
      email: {
        provider: this.email.provider,
        from: this.email.from,
        notificationsEnabled: this.email.notificationsEnabled
      }
    };
  }
}

export const configService = ConfigService.getInstance();
export const config = {
  app: configService.app,
  database: configService.database,
  auth: configService.auth,
  ai: configService.ai,
  storage: configService.storage,
  redis: configService.redis,
  email: configService.email,
  search: configService.search,
  opportunities: configService.opportunities
};

