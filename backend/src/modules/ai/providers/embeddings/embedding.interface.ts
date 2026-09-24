export interface VectorEmbedding {
  text: string;
  dimensions: number;
  values: number[];
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<VectorEmbedding>;
  computeCosineSimilarity(v1: number[], v2: number[]): number;
}
