import { KnowledgeBaseService, KnowledgeDocument } from './knowledge-base.service';
import { EmbeddingProvider } from '../providers/embeddings/embedding.interface';
import { EmbeddingFactory } from '../providers/embeddings/embedding-factory';
import { SemanticEmbeddingProvider } from '../providers/embeddings/semantic-embedding.provider';
import { CrossEncoderRerankerProvider, RerankerCandidate } from '../providers/reranker/reranker.provider';
import { LLMProvider } from '../providers/llm/llm.interface';
import { LLMFactory } from '../providers/llm/llm-factory';
import { prisma } from '../../../lib/prisma';

export interface RAGAnswerResponse {
  answer: string;
  retrievedSources: {
    id: string;
    title: string;
    category: string;
    relevanceScore: number;
  }[];
  modelUsed: string;
  latencyMs: number;
  provider: string;
}

export class RAGPipelineService {
  private embeddingProvider: EmbeddingProvider;
  private rerankerProvider: CrossEncoderRerankerProvider;
  private llmProvider: LLMProvider;

  constructor() {
    this.embeddingProvider = EmbeddingFactory.getProvider();
    this.rerankerProvider = new CrossEncoderRerankerProvider();
    this.llmProvider = LLMFactory.getProvider();
  }

  public async query(userQuery: string, roleContext?: string): Promise<RAGAnswerResponse> {
    const startTime = Date.now();

    // Stage 1: Dense Vector Retrieval with Real Platform Opportunities
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(userQuery);
    const documents = [...KnowledgeBaseService.getDocuments()];

    // Dynamically retrieve active database opportunities
    try {
      const realOpportunities = await prisma.opportunity.findMany({
        where: { status: 'ACTIVE' },
        take: 25,
        orderBy: { createdAt: 'desc' }
      });

      realOpportunities.forEach((opp) => {
        const skills: any[] = JSON.parse(opp.requiredSkillsJson || '[]');
        const skillList = skills.map((s) => s.skillName || s).join(', ');
        documents.push({
          id: `opp-${opp.id}`,
          title: `${opp.title} at ${opp.companyName} (${opp.type})`,
          category: 'LIVE_OPPORTUNITY',
          content: `Real Available Opportunity: "${opp.title}" posted by ${opp.companyName}. Type: ${opp.type}. Location: ${opp.location} (${opp.workMode}). Compensation: ${opp.stipendOrSalary}. Required Skills: ${skillList}. Role Details: ${opp.description}. Available Openings: ${opp.openings}. Application Link: /student/internships`,
          keywords: skills.map((s: any) => String(s.skillName || s).toLowerCase())
        });

      });
    } catch (err) {
      console.warn('Failed to dynamically load opportunities into RAG:', err);
    }

    const vectorScored: RerankerCandidate[] = await Promise.all(
      documents.map(async (doc) => {
        const docEmbedding = await this.embeddingProvider.generateEmbedding(`${doc.title} ${doc.content}`);
        const similarity = this.embeddingProvider.computeCosineSimilarity(
          queryEmbedding.values,
          docEmbedding.values
        );
        return {
          id: doc.id,
          title: doc.title,
          vectorSimilarity: similarity,
          metadata: {
            eligibleBranch: true
          }
        };
      })
    );

    // Stage 2: Cross-Encoder Reranker
    const reranked = this.rerankerProvider.rerank(vectorScored, 4);
    const topDocIds = new Set(reranked.map((r) => r.candidateId));
    const retrievedDocs = documents.filter((d) => topDocIds.has(d.id));

    // Stage 3: Prompt Augmentation
    const contextSnippet = retrievedDocs
      .map((d) => `[Source: ${d.title}]\n${d.content}`)
      .join('\n\n');

    const systemPrompt =
      `You are the SkillSync AI Career & Industry Intelligence Assistant for the Ministry of Ayush / AIIA Portal (SIH PS 26044).\n` +
      `User Role Context: ${roleContext || 'STUDENT'}.\n\n` +
      `Response Guidelines:\n` +
      `1. Respond in a clean, natural, and engaging conversational tone.\n` +
      `2. When answering queries about internships, jobs, courses, or required skills, ALWAYS reference the REAL database opportunities provided below. Never invent or hallucinate opportunities.\n` +
      `3. Structure points cleanly with short paragraphs, clear numbers, or simple bullet points.\n` +
      `4. Highlight matching skills and explain any skill gaps clearly with actionable advice.\n` +
      `5. Provide practical, high-value advice specifically relevant to the user's career growth, skill gaps, or research collaborations.\n\n` +
      `VERIFIED PLATFORM KNOWLEDGE BASE & REAL DATABASE OPPORTUNITIES:\n${contextSnippet}`;


    // Stage 4: LLM Inference via Configured Provider
    const llmResponse = await this.llmProvider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ],
      temperature: 0.2
    });

    const latencyMs = Date.now() - startTime;

    // Clean up any accidental markdown wrapper artifacts
    let cleanAnswer = llmResponse.content || '';
    cleanAnswer = cleanAnswer.replace(/^```(?:markdown|text)?\n([\s\S]*?)\n```$/i, '$1').trim();
    cleanAnswer = cleanAnswer.replace(/\*{3,}/g, '**');

    return {
      answer: cleanAnswer,
      retrievedSources: reranked.map((r) => {
        const found = documents.find((d) => d.id === r.candidateId);
        return {
          id: r.candidateId,
          title: r.title,
          category: found ? found.category : 'PLATFORM_KNOWLEDGE',
          relevanceScore: Math.round(r.crossEncoderScore * 100)
        };
      }),
      modelUsed: llmResponse.modelUsed,
      latencyMs,
      provider: llmResponse.provider
    };
  }
}
