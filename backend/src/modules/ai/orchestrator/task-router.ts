export enum AITaskType {
  CAREER_ROADMAP = 'CAREER_ROADMAP',
  SKILL_GAP_EXPLAIN = 'SKILL_GAP_EXPLAIN',
  SEMANTIC_MATCH = 'SEMANTIC_MATCH',
  PLACEMENT_PREDICTION = 'PLACEMENT_PREDICTION',
  DEMAND_FORECAST = 'DEMAND_FORECAST',
  DOCUMENT_PARSE = 'DOCUMENT_PARSE',
  ASSISTANT_RAG = 'ASSISTANT_RAG',
  INTERVIEW_SIMULATOR = 'INTERVIEW_SIMULATOR'
}

export interface ModelRoutingPolicy {
  task: AITaskType;
  primaryEngine: string;
  category: 'LLM' | 'EMBEDDINGS' | 'RERANKER' | 'CLASSICAL_ML' | 'DOCUMENT_AI';
  description: string;
  estimatedLatencyMs: number;
}

export class TaskRouter {
  private static routingTable: Record<AITaskType, ModelRoutingPolicy> = {
    [AITaskType.CAREER_ROADMAP]: {
      task: AITaskType.CAREER_ROADMAP,
      primaryEngine: 'Groq Cloud LPU (llama-3.3-70b-versatile)',
      category: 'LLM',
      description: 'Complex multi-month sequence reasoning and customized milestones generation.',
      estimatedLatencyMs: 380
    },
    [AITaskType.SKILL_GAP_EXPLAIN]: {
      task: AITaskType.SKILL_GAP_EXPLAIN,
      primaryEngine: 'Deterministic Delta Calculator + Groq LLM Reasoner',
      category: 'LLM',
      description: 'Exact numeric gap calculation with natural language remedy explanation.',
      estimatedLatencyMs: 250
    },
    [AITaskType.SEMANTIC_MATCH]: {
      task: AITaskType.SEMANTIC_MATCH,
      primaryEngine: 'Semantic Vector Embeddings (384-dim) + Cross-Encoder Reranker',
      category: 'EMBEDDINGS',
      description: 'Multi-feature cosine similarity search and credential re-ranking.',
      estimatedLatencyMs: 80
    },
    [AITaskType.PLACEMENT_PREDICTION]: {
      task: AITaskType.PLACEMENT_PREDICTION,
      primaryEngine: 'Supervised Placement Logistic Model (7 Features)',
      category: 'CLASSICAL_ML',
      description: 'Deterministic supervised prediction of student campus hiring probability.',
      estimatedLatencyMs: 15
    },
    [AITaskType.DEMAND_FORECAST]: {
      task: AITaskType.DEMAND_FORECAST,
      primaryEngine: 'Time-Series Skill Velocity & Moving Average Forecaster',
      category: 'CLASSICAL_ML',
      description: 'Predicts quarter-over-quarter industry demand surges.',
      estimatedLatencyMs: 20
    },
    [AITaskType.DOCUMENT_PARSE]: {
      task: AITaskType.DOCUMENT_PARSE,
      primaryEngine: 'Document AI / Resume & Certificate Parser',
      category: 'DOCUMENT_AI',
      description: 'Unstructured tokenization and structured JSON extraction.',
      estimatedLatencyMs: 65
    },
    [AITaskType.ASSISTANT_RAG]: {
      task: AITaskType.ASSISTANT_RAG,
      primaryEngine: 'Multi-Stage RAG (Vector Search + Reranker + Groq LLM)',
      category: 'LLM',
      description: 'Domain-grounded conversational counseling using official Ayush/AIIA knowledge.',
      estimatedLatencyMs: 420
    },
    [AITaskType.INTERVIEW_SIMULATOR]: {
      task: AITaskType.INTERVIEW_SIMULATOR,
      primaryEngine: 'Groq Cloud LPU (llama-3.3-70b-versatile)',
      category: 'LLM',
      description: 'Scenario question synthesis and multi-criteria answer evaluation.',
      estimatedLatencyMs: 350
    }
  };

  public static getPolicy(task: AITaskType): ModelRoutingPolicy {
    return this.routingTable[task];
  }

  public static getAllPolicies(): ModelRoutingPolicy[] {
    return Object.values(this.routingTable);
  }
}
