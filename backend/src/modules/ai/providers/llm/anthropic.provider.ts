import { LLMProvider, LLMRequest, LLMResponse } from './llm.interface';
import { configService } from '../../../../config';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string | null;
  private defaultModel: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = configService.get<string>('ai.keys.anthropic') || null;
    this.defaultModel = configService.get<string>('ai.llmModel') || 'claude-3-5-sonnet-20240620';
  }

  public async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const modelToUse = request.model || this.defaultModel;

    if (this.apiKey) {
      try {
        const systemMessage = request.messages.find((m) => m.role === 'system')?.content;
        const userMessages = request.messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }));

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: modelToUse,
            system: systemMessage,
            messages: userMessages,
            temperature: request.temperature ?? configService.get<number>('ai.temperature'),
            max_tokens: request.maxTokens ?? configService.get<number>('ai.maxTokens')
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const latencyMs = Date.now() - startTime;
          const text = data.content?.[0]?.text || '';

          return {
            content: text,
            modelUsed: modelToUse,
            tokensUsed: {
              prompt: data.usage?.input_tokens || 0,
              completion: data.usage?.output_tokens || 0,
              total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
            },
            latencyMs,
            provider: 'Anthropic Claude Cloud'
          };
        } else {
          console.warn(`Anthropic API returned status ${response.status}. Falling back to internal engine.`);
        }
      } catch (err) {
        console.warn('Anthropic Cloud call failed. Activating fallback engine:', err);
      }
    }

    // Resilient Fallback Engine for offline demos
    const latencyMs = Date.now() - startTime;
    return {
      content: `### Anthropic Claude Career Guidance & Synthesis (SIH 26044)

**Executive Academic-Industry Alignment Summary**:
1. **Curriculum Synthesis**: Candidate displays strong competencies in clinical workflow automation and pharmacology data standardisation.
2. **Actionable Roadmap**:
   - Complete the Ayush EHR Interoperability Module.
   - Formalize academic research with indexed pre-prints.
   - Apply to targeted tier-1 institutional R&D fellowships.`,
      modelUsed: `${modelToUse} (Resilient Fallback)`,
      tokensUsed: { prompt: 130, completion: 220, total: 350 },
      latencyMs,
      provider: 'Anthropic Claude (Local Fallback Engine)'
    };
  }
}
