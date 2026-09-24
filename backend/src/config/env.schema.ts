import { z } from 'zod';

export const envSchema = z
  .object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    API_PREFIX: z.string().default('api/v1'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('debug'),

    // Database
    DATABASE_URL: z.string({
      required_error: 'DATABASE_URL is required to connect to the database.'
    }).min(1, 'DATABASE_URL cannot be empty.'),
    DIRECT_DATABASE_URL: z.string().optional(),

    // Authentication & JWT
    JWT_SECRET: z.string({
      required_error: 'JWT_SECRET is required to secure user tokens.'
    }).min(8, 'JWT_SECRET must be at least 8 characters long.'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_SECRET: z.string().optional().default('skillsync-default-refresh-secret-2026'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    // OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z.string().optional(),

    // AI & LLM
    AI_PROVIDER: z.enum(['groq', 'openai', 'gemini', 'anthropic']).default('groq'),
    LLM_MODEL: z.string().default('llama-3.3-70b-versatile'),
    LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
    LLM_MAX_TOKENS: z.coerce.number().positive().default(1024),
    GROQ_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),

    // Embeddings & Reranker
    EMBEDDING_PROVIDER: z.enum(['dense-local', 'openai']).default('dense-local'),
    EMBEDDING_MODEL: z.string().default('all-MiniLM-L6-v2'),
    EMBEDDING_DIMENSIONS: z.coerce.number().default(384),
    RERANKER_PROVIDER: z.enum(['cross-encoder', 'cohere', 'disabled']).default('cross-encoder'),
    RERANKER_MODEL: z.string().default('ms-marco-MiniLM-L-6-v2'),

    // Vector Database
    VECTOR_DATABASE_URL: z.string().optional().default('postgresql://postgres:password123@localhost:5432/skillsync'),
    VECTOR_TABLE: z.string().default('skill_embeddings'),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    QUEUE_REDIS_URL: z.string().optional().default('redis://localhost:6379/1'),

    // Storage
    STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional().default('ap-south-1'),
    S3_BUCKET: z.string().optional().default('skillsync-resumes'),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),

    // Email
    EMAIL_PROVIDER: z.enum(['console', 'smtp', 'sendgrid']).default('console'),
    SMTP_HOST: z.string().optional().default('smtp.mailtrap.io'),
    SMTP_PORT: z.coerce.number().optional().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().default('no-reply@skillsync.edu'),

    // Notifications & Document AI
    NOTIFICATION_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
    OCR_PROVIDER: z.string().default('internal'),
    DOCUMENT_AI_PROVIDER: z.string().default('internal-parser'),

    // Search & External APIs
    SEARCH_PROVIDER: z.string().default('internal'),
    SEARCH_API_KEY: z.string().optional(),
    SEARCH_BASE_URL: z.string().optional(),
    SEARXNG_URL: z.string().optional(),

    // External Opportunity Providers (Adzuna, Udemy) & Sync Engine
    ADZUNA_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
    ADZUNA_APP_ID: z.string().optional(),
    ADZUNA_APP_KEY: z.string().optional(),
    ADZUNA_COUNTRY: z.string().default('in'),
    UDEMY_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
    UDEMY_CLIENT_ID: z.string().optional(),
    UDEMY_CLIENT_SECRET: z.string().optional(),
    OPPORTUNITY_SYNC_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
    OPPORTUNITY_SYNC_INTERVAL_MINUTES: z.coerce.number().default(60),

    // Security
    ENCRYPTION_KEY: z.string().default('skillsync-32-char-encryption-key-sih2026'),
    SESSION_SECRET: z.string().default('skillsync-session-security-token-secret')
  })

  .superRefine((data, ctx) => {
    // Conditional validation for AI Provider keys in production mode
    if (data.NODE_ENV === 'production') {
      if (data.AI_PROVIDER === 'openai' && !data.OPENAI_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['OPENAI_API_KEY'],
          message: 'OPENAI_API_KEY is required when AI_PROVIDER is set to "openai" in production.'
        });
      }
      if (data.AI_PROVIDER === 'gemini' && !data.GEMINI_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['GEMINI_API_KEY'],
          message: 'GEMINI_API_KEY is required when AI_PROVIDER is set to "gemini" in production.'
        });
      }
      if (data.AI_PROVIDER === 'anthropic' && !data.ANTHROPIC_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ANTHROPIC_API_KEY'],
          message: 'ANTHROPIC_API_KEY is required when AI_PROVIDER is set to "anthropic" in production.'
        });
      }
      if (data.STORAGE_PROVIDER === 's3' && (!data.S3_ACCESS_KEY || !data.S3_SECRET_KEY)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['S3_ACCESS_KEY'],
          message: 'S3_ACCESS_KEY and S3_SECRET_KEY are required when STORAGE_PROVIDER is set to "s3" in production.'
        });
      }
    }
  });

export type ValidatedEnv = z.infer<typeof envSchema>;
