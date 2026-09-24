import { ValidatedEnv } from './env.schema';

export interface AIConfig {
  provider: 'groq' | 'openai' | 'gemini' | 'anthropic';
  llmModel: string;
  temperature: number;
  maxTokens: number;
  keys: {
    groq?: string;
    openai?: string;
    gemini?: string;
    anthropic?: string;
  };
  embeddings: {
    provider: 'dense-local' | 'openai';
    model: string;
    dimensions: number;
  };
  reranker: {
    provider: 'cross-encoder' | 'cohere' | 'disabled';
    model: string;
  };
  documentAi: {
    ocrProvider: string;
    parserProvider: string;
  };
}

export const getAIConfig = (env: ValidatedEnv): AIConfig => ({
  provider: env.AI_PROVIDER,
  llmModel: env.LLM_MODEL,
  temperature: env.LLM_TEMPERATURE,
  maxTokens: env.LLM_MAX_TOKENS,
  keys: {
    groq: env.GROQ_API_KEY,
    openai: env.OPENAI_API_KEY,
    gemini: env.GEMINI_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY
  },
  embeddings: {
    provider: env.EMBEDDING_PROVIDER,
    model: env.EMBEDDING_MODEL,
    dimensions: env.EMBEDDING_DIMENSIONS
  },
  reranker: {
    provider: env.RERANKER_PROVIDER,
    model: env.RERANKER_MODEL
  },
  documentAi: {
    ocrProvider: env.OCR_PROVIDER,
    parserProvider: env.DOCUMENT_AI_PROVIDER
  }
});
