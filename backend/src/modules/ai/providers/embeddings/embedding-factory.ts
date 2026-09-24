import { EmbeddingProvider } from './embedding.interface';
import { SemanticEmbeddingProvider } from './semantic-embedding.provider';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider';
import { configService } from '../../../../config';

export class EmbeddingFactory {
  private static instance: EmbeddingProvider;

  public static getProvider(): EmbeddingProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = configService.get<string>('ai.embeddings.provider')?.toLowerCase() || 'dense-local';

    switch (providerType) {
      case 'openai':
        this.instance = new OpenAIEmbeddingProvider();
        break;
      case 'dense-local':
      default:
        this.instance = new SemanticEmbeddingProvider();
        break;
    }

    return this.instance;
  }
}
