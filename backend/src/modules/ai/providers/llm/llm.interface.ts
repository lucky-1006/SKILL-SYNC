export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  modelUsed: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latencyMs: number;
  provider: string;
}

export interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
