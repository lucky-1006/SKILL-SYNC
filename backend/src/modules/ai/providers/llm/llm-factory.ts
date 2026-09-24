import { LLMProvider, LLMRequest, LLMResponse } from './llm.interface';
import { GroqProvider } from './groq.provider';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { AnthropicProvider } from './anthropic.provider';
import { configService } from '../../../../config';

/**
 * Resilient Multi-Provider LLM that automatically routes between live Groq and live Gemini
 */
export class HybridLiveLLMProvider implements LLMProvider {
  private groq: GroqProvider;
  private gemini: GeminiProvider;
  private primaryProviderName: string;

  constructor() {
    this.groq = new GroqProvider();
    this.gemini = new GeminiProvider();
    this.primaryProviderName = (configService.get<string>('ai.provider') || 'groq').toLowerCase();
  }

  public async generate(request: LLMRequest): Promise<LLMResponse> {
    const primary = this.primaryProviderName === 'gemini' ? this.gemini : this.groq;
    const secondary = this.primaryProviderName === 'gemini' ? this.groq : this.gemini;

    // 1. Try Primary Live Provider
    try {
      const response = await primary.generate(request);
      if (response.provider.includes('Live')) {
        return response;
      }
    } catch (err) {
      console.warn('Primary LLM provider failed, failing over to secondary live provider:', err);
    }

    // 2. Try Secondary Live Provider
    try {
      const response = await secondary.generate(request);
      if (response.provider.includes('Live')) {
        return response;
      }
    } catch (err) {
      console.warn('Secondary LLM provider failed:', err);
    }

    // 3. If both external APIs fail, return primary's response (with domain knowledge)
    return primary.generate(request);
  }
}

export class LLMFactory {
  private static instance: LLMProvider;

  public static getProvider(): LLMProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = configService.get<string>('ai.provider')?.toLowerCase() || 'groq';

    switch (providerType) {
      case 'openai':
        this.instance = new OpenAIProvider();
        break;
      case 'anthropic':
        this.instance = new AnthropicProvider();
        break;
      case 'gemini':
      case 'groq':
      default:
        // Use HybridLiveLLMProvider to ensure live inference with failover between Groq & Gemini
        this.instance = new HybridLiveLLMProvider();
        break;
    }

    return this.instance;
  }

  public static resetProvider(): void {
    this.instance = undefined as unknown as LLMProvider;
  }
}
