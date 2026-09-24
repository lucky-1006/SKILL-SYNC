import { EmbeddingProvider, VectorEmbedding } from './embedding.interface';

export { VectorEmbedding };

export class SemanticEmbeddingProvider implements EmbeddingProvider {
  private readonly dimensions = 384;

  // Domain skill vocabulary with assigned semantic weights
  private domainWeights: Record<string, number> = {
    python: 1.4,
    'machine learning': 1.5,
    'deep learning': 1.5,
    pytorch: 1.4,
    tensorflow: 1.3,
    sql: 1.2,
    docker: 1.3,
    git: 1.1,
    ayush: 1.6,
    ayurveda: 1.6,
    fhir: 1.4,
    bioinformatics: 1.5,
    healthcare: 1.4,
    nlp: 1.4,
    transformers: 1.4,
    rag: 1.4,
    fastapi: 1.2,
    react: 1.1,
    statistics: 1.3,
    communication: 1.0,
    aptitude: 1.0
  };

  /**
   * Generates a deterministic 384-dimensional dense semantic embedding vector
   */
  public async generateEmbedding(text: string): Promise<VectorEmbedding> {
    const cleanText = (text || '').toLowerCase();
    const tokens = cleanText.split(/[\s,.-]+/).filter((t) => t.length > 1);

    const values = new Array<number>(this.dimensions).fill(0);

    tokens.forEach((token, index) => {
      const weight = this.domainWeights[token] || 1.0;

      // Hash token into dimensions
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }

      const primaryDim = Math.abs(hash) % this.dimensions;
      const secondaryDim = (primaryDim * 31 + index) % this.dimensions;

      values[primaryDim] += 0.8 * weight;
      values[secondaryDim] += 0.4 * weight;
    });

    // L2 Normalize Vector
    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    const normalizedValues = values.map((v) => Number((v / norm).toFixed(6)));

    return {
      text,
      dimensions: this.dimensions,
      values: normalizedValues
    };
  }

  /**
   * Computes Cosine Similarity between two embedding vectors
   * Returns a score between 0.0 and 1.0
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return Math.max(0, Math.min(1.0, dotProduct / denominator));
  }

  public computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    return SemanticEmbeddingProvider.cosineSimilarity(vecA, vecB);
  }
}
