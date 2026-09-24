import { EmbeddingProvider, VectorEmbedding } from './embedding.interface';
import { SemanticEmbeddingProvider } from './semantic-embedding.provider';
import { configService } from '../../../../config';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string | null;
  private model: string;
  private dimensions: number;
  private fallbackProvider: SemanticEmbeddingProvider;

  constructor() {
    this.apiKey = configService.get<string>('ai.keys.openai') || null;
    this.model = configService.get<string>('ai.embeddings.model') || 'text-embedding-3-small';
    this.dimensions = configService.get<number>('ai.embeddings.dimensions') || 1536;
    this.fallbackProvider = new SemanticEmbeddingProvider();
  }

  public async generateEmbedding(text: string): Promise<VectorEmbedding> {
    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            input: text
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const embeddingValues = data.data?.[0]?.embedding || [];
          return {
            text,
            dimensions: embeddingValues.length,
            values: embeddingValues
          };
        }
      } catch (err) {
        console.warn('OpenAI Embedding API call failed. Using local fallback vector engine:', err);
      }
    }

    // Return fallback dense vector
    return this.fallbackProvider.generateEmbedding(text);
  }

  public computeCosineSimilarity(v1: number[], v2: number[]): number {
    return this.fallbackProvider.computeCosineSimilarity(v1, v2);
  }
}
